import { useQuery } from '@tanstack/react-query';
import { households as householdsApi } from '../../services/api';
import type { HouseholdSummary } from '../../services/api/households';

export interface ActiveHouseholdState {
  household: HouseholdSummary | null;
  households: HouseholdSummary[];
  isLoading: boolean;
  isError: boolean;
}

export function useActiveHousehold(): ActiveHouseholdState {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['households'],
    queryFn: () => householdsApi.list(),
    staleTime: 60_000,
  });

  const list = data?.households ?? [];
  return {
    household: list[0] ?? null,
    households: list,
    isLoading,
    isError,
  };
}
