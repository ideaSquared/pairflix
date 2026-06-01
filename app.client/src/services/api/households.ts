import { fetchWithAuth } from './utils';

export type Mood =
  | 'funny'
  | 'dark'
  | 'feelgood'
  | 'tense'
  | 'romantic'
  | 'thoughtful'
  | 'action';

export interface ProviderEntry {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
}

export interface WatchProviders {
  flatrate?: ProviderEntry[];
  free?: ProviderEntry[];
  ads?: ProviderEntry[];
  buy?: ProviderEntry[];
  rent?: ProviderEntry[];
}

export interface RecommendationCard {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  year: number | null;
  runtime: number | null;
  overview: string;
  poster_path: string | null;
  providers: WatchProviders;
}

export interface RecommendationResult {
  pick: RecommendationCard;
  alternates: RecommendationCard[];
  rationale: string;
  score: number;
}

export interface PickRequest {
  mood: Mood;
  minutes: number;
  providers?: string[];
  region?: string;
  excludeTmdbIds?: number[];
}

export const households = {
  pick: async (
    householdId: string,
    body: PickRequest
  ): Promise<RecommendationResult> => {
    return fetchWithAuth(`/api/households/${householdId}/pick`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  commit: async (
    householdId: string,
    tmdbId: number,
    body: { media_type: 'movie' | 'tv'; mood?: Mood; minutes?: number }
  ) => {
    return fetchWithAuth(
      `/api/households/${householdId}/picks/${tmdbId}/commit`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },
};
