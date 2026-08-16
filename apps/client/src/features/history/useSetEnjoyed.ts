import { useMutation, useQueryClient } from '@tanstack/react-query';
import { history, type HistoryEntry } from '../../services/api';

interface SetEnjoyedArgs {
  watchedId: string;
  enjoyed: boolean;
}

export function useSetEnjoyed(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<{ entry: HistoryEntry }, Error, SetEnjoyedArgs>({
    mutationFn: async ({ watchedId, enjoyed }) => {
      if (!householdId) {
        throw new Error('No household selected');
      }
      return history.setEnjoyed(householdId, watchedId, enjoyed);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['history', householdId],
      });
    },
  });
}
