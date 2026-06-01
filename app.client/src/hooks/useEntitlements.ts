import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { billing, type Entitlements } from '../services/api';

export function useEntitlements(
  householdId: string | undefined
): UseQueryResult<Entitlements> {
  return useQuery<Entitlements>(
    ['entitlements', householdId],
    () => {
      if (!householdId) {
        return Promise.reject(new Error('householdId required'));
      }
      return billing.getEntitlements(householdId);
    },
    {
      enabled: Boolean(householdId),
      staleTime: 30 * 1000,
    }
  );
}
