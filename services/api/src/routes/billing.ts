import { createDb, subscriptions, type Database } from '@pairflix/db';
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
	metadata?: Record<string, string>;
};

/** Upserts a household's subscription row to premium/active. Shared by both webhook handlers
 * below since either can be the first to see a given household -- `checkout.session.completed`
 * only ever carries the customer/subscription ids (Stripe's Session object has no period-end),
 * `customer.subscription.created`/`.updated` carry the real `current_period_end` this product's
 * `isEffectivelyPremium` check requires but arrive keyed by customer id, which may not be on the
 * row yet the very first time. */
const upsertPremiumSubscription = async (
	db: Database,
	householdId: string,
	fields: {
		stripeCustomerId: string;
		stripeSubscriptionId?: string;
		currentPeriodEnd?: Date;
	}
): Promise<void> => {
	const now = new Date();
	await db
		.insert(subscriptions)
		.values({
			id: newId('sub'),
			householdId,
			tier: 'premium',
			status: 'active',
			...fields,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: subscriptions.householdId,
			set: { tier: 'premium', status: 'active', ...fields, updatedAt: now },
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
		type: string;
		data: { object: unknown };
	};
	const db = createDb(c.env.DB);

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
			const updated = await db
				.update(subscriptions)
				.set({
					tier: 'premium',
					status: 'active',
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
				await upsertPremiumSubscription(db, subscription.metadata.householdId, {
					stripeCustomerId: subscription.customer,
					stripeSubscriptionId: subscription.id,
					currentPeriodEnd,
				});
			}
			await auditInfo(db, 'Stripe subscription active', 'stripe-webhook', {
				stripeCustomerId: subscription.customer,
			});
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
	}

	return c.json({ received: true });
});
