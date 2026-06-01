import { useMutation } from '@tanstack/react-query';
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
  return useMutation<RecommendationResult, Error, PickRequest>(body =>
    households.pick(householdId, body)
  );
}

export function useCommitPick({ householdId }: UseTonightPickArgs) {
  return useMutation(
    ({
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
        media_type: mediaType,
        ...(mood ? { mood } : {}),
        ...(minutes !== undefined ? { minutes } : {}),
      })
  );
}
