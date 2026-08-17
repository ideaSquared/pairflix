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

export interface ProviderRegion {
  link?: string;
  flatrate?: ProviderEntry[];
  free?: ProviderEntry[];
  ads?: ProviderEntry[];
  buy?: ProviderEntry[];
  rent?: ProviderEntry[];
}

export interface RecommendationCard {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  year: number | null;
  runtime: number | null;
  overview: string;
  posterPath: string | null;
  providers: ProviderRegion;
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

export interface HouseholdSummary {
  id: string;
  name: string | null;
  role: 'owner' | 'member';
  joinedAt: string;
  memberCount: number;
}

export interface InviteSummary {
  id: string;
  token: string;
  invitedEmail: string | null;
  expiresAt: string;
  acceptedAt: string | null;
}

export const households = {
  list: async (): Promise<{ households: HouseholdSummary[] }> => {
    return fetchWithAuth('/api/households');
  },

  create: async (
    body: { name?: string } = {}
  ): Promise<{ household: HouseholdSummary }> => {
    return fetchWithAuth('/api/households', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  invite: async (
    householdId: string,
    body: { email?: string } = {}
  ): Promise<{ invite: InviteSummary }> => {
    return fetchWithAuth(`/api/households/${householdId}/invites`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  acceptInvite: async (token: string): Promise<{ householdId: string }> => {
    return fetchWithAuth(`/api/households/invites/${token}/accept`, {
      method: 'POST',
    });
  },

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
    body: { mediaType: 'movie' | 'tv'; mood?: Mood; minutes?: number }
  ): Promise<{ id: string }> => {
    return fetchWithAuth(
      `/api/households/${householdId}/picks/${tmdbId}/commit`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },

  recordPickEvent: async (
    householdId: string,
    body: PickEventBody
  ): Promise<{ id: string }> => {
    return fetchWithAuth(`/api/households/${householdId}/pick-events`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  launchProvider: async (
    householdId: string,
    tmdbId: number,
    body: LaunchProviderBody
  ): Promise<LaunchProviderResult> => {
    return fetchWithAuth(
      `/api/households/${householdId}/picks/${tmdbId}/launch`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },
};

export type PickEventKind = 'swapped' | 'dismissed';

export interface PickEventBody {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  kind: PickEventKind;
  mood?: Mood;
  minutesBudget?: number;
}

export interface LaunchProviderBody {
  providerSlug: string;
  mediaType: 'movie' | 'tv';
  region?: string;
}

export interface LaunchProviderResult {
  url: string;
  providerName: string;
  region: string;
}
