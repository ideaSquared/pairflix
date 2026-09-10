import {
	createDb,
	stripeEvents,
	subscriptions,
	type Database,
} from '@pairflix/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { auditInfo } from '../lib/audit';
import { newId } from '../lib/id';
import { isStripeConfigured, verifyWebhookSignature } from '../lib/stripe';
import type { AppEnv } from '../types';

/**
 * Global Stripe surface -- unlike the household-scoped checkout/portal actions
 * (routes/households.ts, gated by requireHouseholdOwner), `/status` and `/webhook` must stay
 * public and unscoped to any one household: the frontend checks `/status` before showing a real
 * "subscribe" button, and Stripe calls `/webhook` with no household context in the URL at all
 * (the household is resolved from the event payload's metadata). Mounted at `/api/billing`.
 */
export const billingRoutes = new Hono<AppEnv>();

billingRoutes.get('/status', c => {
	return c.json({ configured: isStripeConfigured(c.env) });
});

type StripeCheckoutSessionObject = {
	customer?: string;
	subscription?: string;
	metadata?: Record<string, string>;
};

type StripeSubscriptionObject = {
	id: string;
	customer?: string;
	current_period_end?: number;
	status?: string;
	metadata?: Record<string, string>;
};

type StripeInvoiceObject = {
	customer?: string;
};

type LocalSubscriptionStatus = 'active' | 'past_due' | 'canceled';

/** Maps Stripe's subscription statuses onto this product's 3-value local enum. `active`/
 * `trialing` grant premium (a trial should unlock it same as a paid period); `past_due`/`unpaid`
 * map to local `past_due`, which `lib/entitlements.ts`'s `isEffectivelyPremium` already treats as
 * not-premium without deleting the row (payment can still recover); everything else
 * (`incomplete`, `incomplete_expired`, `paused`, `canceled`, and any future/unknown status) maps
 * to `canceled` -- fails closed to no-premium rather than granting access for a status this
 * mapping doesn't recognize. */
const mapStripeStatus = (
	stripeStatus: string | undefined
): LocalSubscriptionStatus => {
	if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active';
	if (stripeStatus === 'past_due' || stripeStatus === 'unpaid')
		return 'past_due';
	return 'canceled';
};

/** Upserts a household's subscription row to premium. Shared by both webhook handlers below
 * since either can be the first to see a given household -- `checkout.session.completed` only
 * ever carries the customer/subscription ids (Stripe's Session object has no period-end),
 * `customer.subscription.created`/`.updated` carry the real `current_period_end` this product's
 * `isEffectivelyPremium` check requires but arrive keyed by customer id, which may not be on the
 * row yet the very first time. `status` defaults to 'active' for the checkout-completed caller,
 * which has no Stripe subscription status to read yet -- payment having just succeeded is the
 * best available signal until the subscription object's own event arrives. */
const upsertPremiumSubscription = async (
	db: Database,
	householdId: string,
	fields: {
		stripeCustomerId: string;
		stripeSubscriptionId?: string;
		currentPeriodEnd?: Date;
		status?: LocalSubscriptionStatus;
	}
): Promise<void> => {
	const now = new Date();
	const { status = 'active', ...rest } = fields;
	await db
		.insert(subscriptions)
		.values({
			id: newId('sub'),
			householdId,
			tier: 'premium',
			status,
			...rest,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: subscriptions.householdId,
			set: { tier: 'premium', status, ...rest, updatedAt: now },
		});
};

billingRoutes.post('/webhook', async c => {
	const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) return c.json({ error: 'not_configured' }, 501);

	const payload = await c.req.text();
	const valid = await verifyWebhookSignature(
		payload,
		c.req.header('stripe-signature') ?? null,
		webhookSecret
	);
	if (!valid) return c.json({ error: 'invalid_signature' }, 400);

	// Trusted Stripe API response body -- shape documented at stripe.com/docs/api/events/object.
	const event = JSON.parse(payload) as {
		id: string;
		type: string;
		data: { object: unknown };
	};
	const db = createDb(c.env.DB);

	// Idempotency: Stripe retries a webhook delivery on anything but a 2xx, so the same event id
	// can arrive more than once. The insert's primary key conflict is the atomicity guarantee --
	// two concurrent deliveries of the same event can't both see `recorded.length > 0`.
	const recorded = await db
		.insert(stripeEvents)
		.values({ id: event.id, type: event.type, processedAt: new Date() })
		.onConflictDoNothing()
		.returning({ id: stripeEvents.id });
	if (recorded.length === 0) {
		return c.json({ received: true, duplicate: true });
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as StripeCheckoutSessionObject;
		const householdId = session.metadata?.householdId;
		if (householdId && session.customer) {
			await upsertPremiumSubscription(db, householdId, {
				stripeCustomerId: session.customer,
				stripeSubscriptionId: session.subscription,
			});
			await auditInfo(db, 'Stripe checkout completed', 'stripe-webhook', {
				householdId,
			});
		}
	} else if (
		event.type === 'customer.subscription.created' ||
		event.type === 'customer.subscription.updated'
	) {
		const subscription = event.data.object as StripeSubscriptionObject;
		if (subscription.customer && subscription.current_period_end) {
			const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
			const status = mapStripeStatus(subscription.status);

			const existing = await db
				.select({
					status: subscriptions.status,
					stripeSubscriptionId: subscriptions.stripeSubscriptionId,
					currentPeriodEnd: subscriptions.currentPeriodEnd,
				})
				.from(subscriptions)
				.where(eq(subscriptions.stripeCustomerId, subscription.customer))
				.get();
			// A subscription already marked canceled for this same Stripe subscription id never
			// re-activates from a delayed/out-of-order `updated` event -- a real resubscribe gets a
			// new Stripe subscription id, which isn't blocked by this check. Also guards against a
			// delayed event whose period-end predates what's already stored, since Stripe's own
			// current_period_end only moves forward as a subscription renews.
			const existingPeriodEnd = existing?.currentPeriodEnd ?? null;
			const isStaleUpdate =
				(existing?.status === 'canceled' &&
					existing.stripeSubscriptionId === subscription.id) ||
				(existingPeriodEnd !== null &&
					currentPeriodEnd.getTime() < existingPeriodEnd.getTime());

			if (isStaleUpdate) {
				await auditInfo(
					db,
					'Stripe subscription update ignored as stale',
					'stripe-webhook',
					{ stripeCustomerId: subscription.customer, status }
				);
			} else {
				const updated = await db
					.update(subscriptions)
					.set({
						tier: 'premium',
						status,
						stripeSubscriptionId: subscription.id,
						currentPeriodEnd,
						updatedAt: new Date(),
					})
					.where(eq(subscriptions.stripeCustomerId, subscription.customer))
					.returning({ householdId: subscriptions.householdId });
				// This event beat checkout.session.completed to stamping stripeCustomerId onto the
				// row -- subscription_data.metadata (lib/stripe.ts's createCheckoutSession) carries
				// the same householdId, so it's resolvable here too.
				if (updated.length === 0 && subscription.metadata?.householdId) {
					await upsertPremiumSubscription(
						db,
						subscription.metadata.householdId,
						{
							stripeCustomerId: subscription.customer,
							stripeSubscriptionId: subscription.id,
							currentPeriodEnd,
							status,
						}
					);
				}
				await auditInfo(db, 'Stripe subscription updated', 'stripe-webhook', {
					stripeCustomerId: subscription.customer,
					status,
				});
			}
		}
	} else if (event.type === 'customer.subscription.deleted') {
		const subscription = event.data.object as StripeSubscriptionObject;
		if (subscription.customer) {
			// currentPeriodEnd is left untouched, matching lib/billing.ts's mock cancelSubscription.
			await db
				.update(subscriptions)
				.set({ status: 'canceled', updatedAt: new Date() })
				.where(eq(subscriptions.stripeCustomerId, subscription.customer));
			await auditInfo(db, 'Stripe subscription canceled', 'stripe-webhook', {
				stripeCustomerId: subscription.customer,
			});
		}
	} else if (event.type === 'invoice.payment_failed') {
		const invoice = event.data.object as StripeInvoiceObject;
		if (invoice.customer) {
			await db
				.update(subscriptions)
				.set({ status: 'past_due', updatedAt: new Date() })
				.where(eq(subscriptions.stripeCustomerId, invoice.customer));
			await auditInfo(db, 'Stripe invoice payment failed', 'stripe-webhook', {
				stripeCustomerId: invoice.customer,
			});
		}
	}

	return c.json({ received: true });
});
