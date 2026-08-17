import { subscriptions, type Database } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../types';
import { newId } from './id';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CheckoutSession = { checkoutUrl: string };

export const startCheckout = (
	householdId: string,
	tier: 'premium' = 'premium'
): CheckoutSession => {
	// TODO: replace with stripe.checkout.sessions.create(...) when Stripe goes live.
	return {
		checkoutUrl: `/billing/mock-checkout?household=${householdId}&tier=${tier}`,
	};
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
