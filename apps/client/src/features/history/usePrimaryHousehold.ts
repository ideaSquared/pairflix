import { useQuery } from '@tanstack/react-query';
import { households as householdsApi } from '../../services/api';

// Same '['households']' query key as useActiveHousehold (Tonight) -- shares its cache entry
// rather than issuing a second, redundant fetch for the same list.
export function usePrimaryHousehold() {
  const query = useQuery({
    queryKey: ['households'],
    queryFn: () => householdsApi.list(),
    staleTime: 60_000,
  });

  return { ...query, data: query.data?.households[0] ?? null };
}
