import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import {
	callApp,
	createLoggedInUser,
	postJson,
	type Cookies,
} from '../test/test-helpers';

let counter = 0;
const uniqueEmail = () => `billing-e2e-${Date.now()}-${counter++}@example.com`;

const createHousehold = async (cookies: Cookies): Promise<string> => {
	const result = await postJson<{ household: { id: string } }>(
		'/api/households',
		{},
		cookies
	);
	if (result.status !== 201) {
		throw new Error(
			`createHousehold failed: ${result.status} ${JSON.stringify(result.body)}`
		);
	}
	return result.body.household.id;
};

type SubscriptionRow = {
	tier: string;
	status: string;
	stripe_customer_id: string | null;
	stripe_subscription_id: string | null;
	current_period_end: number | null;
};

const getSubscriptionRow = (
	householdId: string
): Promise<SubscriptionRow | null> =>
	env.DB.prepare('SELECT * FROM subscriptions WHERE household_id = ?1')
		.bind(householdId)
		.first<SubscriptionRow>();

const WEBHOOK_SECRET = 'whsec_test_secret'; // matches vitest.config.mts's fixed test binding
const encoder = new TextEncoder();

/** Independent of routes/billing.ts's own verifyWebhookSignature call -- signs the same way
 * Stripe itself does, not by reusing the code under test (mirrors lib/stripe.test.ts's `sign`). */
const signWebhook = async (payload: string): Promise<string> => {
	const timestamp = Math.floor(Date.now() / 1000);
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(WEBHOOK_SECRET),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const digest = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(`${timestamp}.${payload}`)
	);
	const hex = [...new Uint8Array(digest)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	return `t=${timestamp},v1=${hex}`;
};

let eventCounter = 0;
const nextEventId = () => `evt_test_${Date.now()}_${eventCounter++}`;

/** `id` defaults to a fresh value per call -- pass an explicit one to simulate Stripe redelivering
 * the same event (retried after a non-2xx, or genuinely out of order). */
const postWebhook = async (
	event: Record<string, unknown>,
	id: string = nextEventId()
) => {
	const payload = JSON.stringify({ id, ...event });
	const signature = await signWebhook(payload);
	return callApp('/api/billing/webhook', {
		method: 'POST',
		body: payload,
		headers: {
			'stripe-signature': signature,
			'content-type': 'application/json',
		},
	});
};

describe('GET /api/billing/status', () => {
	it('reports Stripe as unconfigured when the secret key and price id are unset', async () => {
		const result = await callApp<{ configured: boolean }>(
			'/api/billing/status'
		);
		expect(result.status).toBe(200);
		expect(result.body.configured).toBe(false);
	});
});

describe('POST /api/billing/webhook', () => {
	it('rejects a missing signature header', async () => {
		const result = await callApp('/api/billing/webhook', {
			method: 'POST',
			body: JSON.stringify({ type: 'checkout.session.completed' }),
		});
		expect(result.status).toBe(400);
	});

	it('rejects an invalid signature', async () => {
		const result = await callApp('/api/billing/webhook', {
			method: 'POST',
			body: JSON.stringify({ type: 'checkout.session.completed' }),
			headers: { 'stripe-signature': 't=1,v1=not-a-real-signature' },
		});
		expect(result.status).toBe(400);
	});

	it('checkout.session.completed creates a subscription row keyed by householdId, without yet granting premium', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await postWebhook({
			type: 'checkout.session.completed',
			data: {
				object: {
					customer: 'cus_test_1',
					subscription: 'sub_test_1',
					metadata: { householdId },
				},
			},
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.stripe_customer_id).toBe('cus_test_1');
		expect(row?.stripe_subscription_id).toBe('sub_test_1');
		// No current_period_end yet -- Stripe's Session object never carries it, only the
		// Subscription object does (see customer.subscription.updated below). Until it's set,
		// isEffectivelyPremium (lib/entitlements.ts) can't treat this household as premium.
		expect(row?.current_period_end).toBeNull();

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('free');
	});

	it("releases the idempotency claim when handling fails, so Stripe's retry is not skipped", async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const eventId = nextEventId();

		// A household id that doesn't exist fails the subscriptions.household_id foreign key, which
		// is a realistic stand-in for any mid-handling failure after the event has been claimed.
		const failed = await postWebhook(
			{
				type: 'checkout.session.completed',
				data: {
					object: {
						customer: 'cus_test_retry',
						subscription: 'sub_test_retry',
						metadata: { householdId: 'household-does-not-exist' },
					},
				},
			},
			eventId
		);
		expect(failed.status).toBe(500);

		const retried = await postWebhook(
			{
				type: 'checkout.session.completed',
				data: {
					object: {
						customer: 'cus_test_retry',
						subscription: 'sub_test_retry',
						metadata: { householdId },
					},
				},
			},
			eventId
		);
		expect(retried.status).toBe(200);
		expect(retried.body).not.toHaveProperty('duplicate');

		const row = await getSubscriptionRow(householdId);
		expect(row?.stripe_customer_id).toBe('cus_test_retry');
	});

	it('customer.subscription.updated sets current_period_end and actually grants premium', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		await postWebhook({
			type: 'checkout.session.completed',
			data: {
				object: {
					customer: 'cus_test_2',
					subscription: 'sub_test_2',
					metadata: { householdId },
				},
			},
		});

		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
		const result = await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_test_2',
					customer: 'cus_test_2',
					current_period_end: periodEnd,
					status: 'active',
				},
			},
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.tier).toBe('premium');
		expect(row?.status).toBe('active');
		expect(row?.current_period_end).toBe(periodEnd * 1000);

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('premium');
	});

	it('customer.subscription.updated falls back to subscription_data.metadata when it arrives before checkout.session.completed', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

		// No prior checkout.session.completed -- stripeCustomerId isn't on any row yet, so the
		// lookup-by-customer branch finds nothing and this has to fall back to metadata.
		const result = await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_test_3',
					customer: 'cus_test_3',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.tier).toBe('premium');
		expect(row?.stripe_customer_id).toBe('cus_test_3');
		expect(row?.current_period_end).toBe(periodEnd * 1000);
	});

	it('customer.subscription.deleted cancels without resetting current_period_end', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
		await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_test_4',
					customer: 'cus_test_4',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		});

		const result = await postWebhook({
			type: 'customer.subscription.deleted',
			data: { object: { id: 'sub_test_4', customer: 'cus_test_4' } },
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.status).toBe('canceled');
		// Matches lib/billing.ts's mock cancelSubscription -- current_period_end is left as-is.
		expect(row?.current_period_end).toBe(periodEnd * 1000);

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('free');
	});

	it('is a no-op for an event type it does not handle', async () => {
		const result = await postWebhook({
			type: 'invoice.paid',
			data: { object: {} },
		});
		expect(result.status).toBe(200);
	});

	it('does not re-apply a redelivered event with the same id', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
		const event = {
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_dup',
					customer: 'cus_dup',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		};

		const first = await postWebhook(event, 'evt_duplicate_1');
		expect(first.status).toBe(200);

		// Cancel it via a second, distinct event, then redeliver the *first* event's id again --
		// if it were re-applied it would wrongly flip the row back to premium.
		await postWebhook(
			{
				type: 'customer.subscription.deleted',
				data: { object: { id: 'sub_dup', customer: 'cus_dup' } },
			},
			'evt_duplicate_2'
		);

		const redelivered = await postWebhook(event, 'evt_duplicate_1');
		expect(redelivered.status).toBe(200);
		expect(redelivered.body).toMatchObject({ duplicate: true });

		const row = await getSubscriptionRow(householdId);
		expect(row?.status).toBe('canceled');
	});

	it('does not grant premium for a past_due or unpaid subscription status', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

		const result = await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_past_due',
					customer: 'cus_past_due',
					current_period_end: periodEnd,
					status: 'past_due',
					metadata: { householdId },
				},
			},
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.status).toBe('past_due');

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('free');
	});

	it('ignores a subscription.updated that arrives after subscription.deleted for the same subscription', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

		await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_ooo',
					customer: 'cus_ooo',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		});
		await postWebhook({
			type: 'customer.subscription.deleted',
			data: { object: { id: 'sub_ooo', customer: 'cus_ooo' } },
		});

		// A stale `updated` for the same subscription id, delivered late, must not resurrect it.
		const late = await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_ooo',
					customer: 'cus_ooo',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		});
		expect(late.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.status).toBe('canceled');

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('free');
	});

	it('invoice.payment_failed marks the subscription past_due', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

		await postWebhook({
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: 'sub_invoice_fail',
					customer: 'cus_invoice_fail',
					current_period_end: periodEnd,
					status: 'active',
					metadata: { householdId },
				},
			},
		});

		const result = await postWebhook({
			type: 'invoice.payment_failed',
			data: { object: { customer: 'cus_invoice_fail' } },
		});
		expect(result.status).toBe(200);

		const row = await getSubscriptionRow(householdId);
		expect(row?.status).toBe('past_due');

		const entitlements = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(entitlements.body.tier).toBe('free');
	});
});
