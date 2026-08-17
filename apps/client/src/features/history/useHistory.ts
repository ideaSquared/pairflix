import { useQuery } from '@tanstack/react-query';
import { history, type HistoryResponse } from '../../services/api';

export function useHistory(householdId: string | undefined, limit = 50) {
  return useQuery<HistoryResponse>({
    queryKey: ['history', householdId, limit],
    queryFn: () => {
      if (!householdId) {
        return Promise.resolve({
          data: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        });
      }
      return history.list(householdId, limit);
    },
    enabled: Boolean(householdId),
  });
}
