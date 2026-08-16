import type { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import { invalidateEntitlementsCache } from './entitlements.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface CheckoutSession {
	checkout_url: string;
}

/**
 * Returns a placeholder checkout URL. The frontend redirects here today;
 * once Stripe is live this returns the URL from Stripe.
 */
export async function startCheckoutSession(
	householdId: string,
	tier: 'premium' = 'premium'
): Promise<CheckoutSession> {
	// TODO: replace with stripe.checkout.sessions.create({...}) when Stripe goes live.
	const checkout_url = `/billing/mock-checkout?household=${encodeURIComponent(
		householdId
	)}&tier=${encodeURIComponent(tier)}`;
	return { checkout_url };
}

/**
 * Stripe webhook stub. Logs the event and returns 200.
 */
export async function handleStripeWebhook(
	req: Request,
	res: Response
): Promise<void> {
	// TODO: verify signature via stripe.webhooks.constructEvent(rawBody, sig, secret)
	//       and route on event.type (checkout.session.completed,
	//       customer.subscription.updated, customer.subscription.deleted, etc.).
	console.warn('[billing] stripe webhook received (stub):', {
		headers: req.headers['stripe-signature'] ?? null,
		bodyKeys: Object.keys((req.body ?? {}) as Record<string, unknown>),
	});
	res.status(200).json({ received: true });
}

/**
 * Locally mark the household's subscription as canceled. period_end is left
 * intact so the user keeps access until the period rolls over.
 */
export async function cancelSubscription(householdId: string): Promise<void> {
	const sub = await Subscription.findOne({
		where: { household_id: householdId },
	});
	if (!sub) return;
	// TODO: call stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true })
	sub.status = 'canceled';
	await sub.save();
	invalidateEntitlementsCache(householdId);
}

/**
 * Dev-only: flip the household to premium/active for 30 days. Backs the
 * mock-checkout button until Stripe is wired.
 */
export async function mockActivatePremium(householdId: string): Promise<void> {
	const periodEnd = new Date(Date.now() + THIRTY_DAYS_MS);
	const [sub] = await Subscription.findOrCreate({
		where: { household_id: householdId },
		defaults: { household_id: householdId },
	});
	sub.tier = 'premium';
	sub.status = 'active';
	sub.current_period_end = periodEnd;
	await sub.save();
	invalidateEntitlementsCache(householdId);
}

export function isBillingMockEnabled(): boolean {
	const flag = process.env.BILLING_MOCK_ENABLED;
	if (flag === undefined) {
		return process.env.NODE_ENV !== 'production';
	}
	return flag === 'true';
}
