import { fetchWithAuth } from './utils';

export type SubscriptionTier = 'free' | 'premium';

export interface Entitlements {
  tier: SubscriptionTier;
  daily_pick_limit: number;
  picks_used_today: number;
  picks_remaining: number;
  can_use_llm_rerank: boolean;
  can_use_multi_region: boolean;
  region_lock: string | null;
}

export interface CheckoutSession {
  checkout_url: string;
}

export const billing = {
  getEntitlements: (householdId: string): Promise<Entitlements> =>
    fetchWithAuth(
      `/api/households/${encodeURIComponent(householdId)}/entitlements`
    ),
  startCheckout: (
    householdId: string,
    tier: SubscriptionTier = 'premium'
  ): Promise<CheckoutSession> =>
    fetchWithAuth('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ household_id: householdId, tier }),
    }),
  cancel: (householdId: string): Promise<void> =>
    fetchWithAuth('/api/billing/cancel', {
      method: 'POST',
      body: JSON.stringify({ household_id: householdId }),
    }),
  mockActivate: (householdId: string): Promise<{ ok: true }> =>
    fetchWithAuth('/api/billing/mock-activate', {
      method: 'POST',
      body: JSON.stringify({ household_id: householdId }),
    }),
};
