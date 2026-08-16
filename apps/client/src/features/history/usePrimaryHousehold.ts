// TODO: replace with Phase A model on merge
// Stub hook: Phase A will add a real household membership query. Until then
// we read an optional override from `localStorage` so the page is usable
// during development.
import { useQuery } from '@tanstack/react-query';

export interface PrimaryHousehold {
  id: string;
  name: string;
}

export function usePrimaryHousehold() {
  return useQuery<PrimaryHousehold | null>({
    queryKey: ['primary-household'],
    queryFn: async () => {
      const overrideId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('primaryHouseholdId')
          : null;
      if (overrideId) {
        return { id: overrideId, name: 'Household' };
      }
      return null;
    },
  });
}
