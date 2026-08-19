import { subscriptions, users, type Database } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../types';
import { newId } from './id';
import {
	createCheckoutSession,
	createPortalSession,
	isStripeConfigured,
} from './stripe';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CheckoutSession = { checkoutUrl: string };

export const startCheckout = (
	householdId: string,
	tier: 'premium' = 'premium'
): CheckoutSession => {
	return {
		checkoutUrl: `/billing/mock-checkout?household=${householdId}&tier=${tier}`,
	};
};

/** Real Stripe checkout when configured, falling back to the mock above otherwise -- callers
 * (routes/households.ts) don't need to branch on configuration state themselves. Reuses an
 * existing `stripeCustomerId` if this household has checked out before (even if that
 * subscription later lapsed), rather than creating a duplicate Stripe customer every time. */
export const startRealOrMockCheckout = async (
	env: Bindings,
	db: Database,
	householdId: string,
	ownerUserId: string
): Promise<CheckoutSession> => {
	if (!isStripeConfigured(env)) return startCheckout(householdId);

	const [existing, owner] = await Promise.all([
		db
			.select({ stripeCustomerId: subscriptions.stripeCustomerId })
			.from(subscriptions)
			.where(eq(subscriptions.householdId, householdId))
			.get(),
		db
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, ownerUserId))
			.get(),
	]);
	if (!owner) throw new Error('Household owner not found');

	const appClientUrl = env.APP_CLIENT_URL ?? 'http://localhost:5173';
	const session = await createCheckoutSession({
		secretKey: env.STRIPE_SECRET_KEY,
		priceId: env.STRIPE_PRICE_PREMIUM,
		customerId: existing?.stripeCustomerId ?? null,
		customerEmail: owner.email,
		successUrl: `${appClientUrl}/profile?billing=success`,
		cancelUrl: `${appClientUrl}/profile?billing=cancel`,
		householdId,
	});
	return { checkoutUrl: session.url };
};

export type PortalSessionResult =
	| { ok: true; portalUrl: string }
	| { ok: false; reason: 'not_configured' | 'no_customer' };

/** Stripe's self-service Billing Portal -- where a real subscription actually gets changed or
 * canceled once Stripe is live (unlike `cancelSubscription` below, which only ever moves this
 * product's own DB state, mock or not). 400s via `reason: 'no_customer'` until the household has
 * completed a real checkout at least once. */
export const startPortalSession = async (
	env: Bindings,
	db: Database,
	householdId: string
): Promise<PortalSessionResult> => {
	if (!isStripeConfigured(env)) return { ok: false, reason: 'not_configured' };

	const existing = await db
		.select({ stripeCustomerId: subscriptions.stripeCustomerId })
		.from(subscriptions)
		.where(eq(subscriptions.householdId, householdId))
		.get();
	if (!existing?.stripeCustomerId) return { ok: false, reason: 'no_customer' };

	const appClientUrl = env.APP_CLIENT_URL ?? 'http://localhost:5173';
	const session = await createPortalSession({
		secretKey: env.STRIPE_SECRET_KEY,
		customerId: existing.stripeCustomerId,
		returnUrl: `${appClientUrl}/profile`,
	});
	return { ok: true, portalUrl: session.url };
};

export const isBillingMockEnabled = (env: Bindings): boolean => {
	if (env.BILLING_MOCK_ENABLED === undefined) {
		return env.ENVIRONMENT !== 'production';
	}
	return env.BILLING_MOCK_ENABLED === 'true';
};

export const cancelSubscription = async (
	db: Database,
	householdId: string
): Promise<boolean> => {
	const sub = await db
		.select({ id: subscriptions.id })
		.from(subscriptions)
		.where(eq(subscriptions.householdId, householdId))
		.get();
	if (!sub) return false;

	// currentPeriodEnd is left untouched -- access persists until the existing period rolls over.
	await db
		.update(subscriptions)
		.set({ status: 'canceled', updatedAt: new Date() })
		.where(eq(subscriptions.householdId, householdId));
	return true;
};

/** No payment gate here -- the caller already checked `isBillingMockEnabled` and household
 * ownership before invoking this; mirrors Express's deliberate no-gate demo behavior. */
export const mockActivatePremium = async (
	db: Database,
	householdId: string
): Promise<void> => {
	const now = new Date();
	const currentPeriodEnd = new Date(now.getTime() + THIRTY_DAYS_MS);

	await db
		.insert(subscriptions)
		.values({
			id: newId('sub'),
			householdId,
			tier: 'premium',
			status: 'active',
			currentPeriodEnd,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: subscriptions.householdId,
			set: {
				tier: 'premium',
				status: 'active',
				currentPeriodEnd,
				updatedAt: now,
			},
		});
};
