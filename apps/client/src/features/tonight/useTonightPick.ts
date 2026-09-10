import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  households,
  type Mood,
  type PickRequest,
  type RecommendationResult,
} from '../../services/api/households';

export interface UseTonightPickArgs {
  householdId: string;
}

export function useTonightPick({ householdId }: UseTonightPickArgs) {
  const queryClient = useQueryClient();
  return useMutation<RecommendationResult, Error, PickRequest>({
    mutationFn: body => households.pick(householdId, body),
    onSuccess: () => {
      // A pick consumes the household's daily quota server-side -- the cached entitlements
      // (30s staleTime) would otherwise keep showing stale "picks remaining" until it expires.
      void queryClient.invalidateQueries({
        queryKey: ['entitlements', householdId],
      });
    },
  });
}

export function useCommitPick({ householdId }: UseTonightPickArgs) {
  return useMutation({
    mutationFn: ({
      tmdbId,
      mediaType,
      mood,
      minutes,
    }: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      mood?: Mood;
      minutes?: number;
    }) =>
      households.commit(householdId, tmdbId, {
        mediaType,
        ...(mood ? { mood } : {}),
        ...(minutes !== undefined ? { minutes } : {}),
      }),
  });
}
