import { fetchWithAuth } from './utils';

export type SubscriptionTier = 'free' | 'premium';

export interface Entitlements {
  tier: SubscriptionTier;
  dailyPickLimit: number;
  picksUsedToday: number;
  picksRemaining: number;
  canUseLlmRerank: boolean;
  canUseMultiRegion: boolean;
  regionLock: string | null;
}

export interface CheckoutSession {
  checkoutUrl: string;
}

const billingPath = (householdId: string, action: string) =>
  `/api/households/${encodeURIComponent(householdId)}/billing/${action}`;

export const billing = {
  getEntitlements: (householdId: string): Promise<Entitlements> =>
    fetchWithAuth(
      `/api/households/${encodeURIComponent(householdId)}/entitlements`
    ),
  startCheckout: (
    householdId: string,
    tier: SubscriptionTier = 'premium'
  ): Promise<CheckoutSession> =>
    fetchWithAuth(billingPath(householdId, 'checkout'), {
      method: 'POST',
      body: JSON.stringify({ tier }),
    }),
  cancel: async (householdId: string): Promise<void> => {
    await fetchWithAuth(billingPath(householdId, 'cancel'), {
      method: 'POST',
    });
  },
  mockActivate: (householdId: string): Promise<{ ok: true }> =>
    fetchWithAuth(billingPath(householdId, 'mock-activate'), {
      method: 'POST',
    }),
};
