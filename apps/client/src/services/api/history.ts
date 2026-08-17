import { fetchWithAuth } from './utils';
import type { ProviderRegion } from './households';

export interface HistoryEntry {
  id: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  watchedAt: string;
  enjoyed: boolean | null;
  moodAtPick: string | null;
  minutesBudgetAtPick: number | null;
  title: string | null;
  year: number | null;
  posterPath: string | null;
  providers: ProviderRegion;
}

export interface HistoryResponse {
  data: HistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const history = {
  /**
   * List a household's watch-together history, newest first.
   */
  list: async (householdId: string, limit = 50): Promise<HistoryResponse> => {
    return fetchWithAuth(
      `/api/households/${householdId}/history?limit=${limit}`
    );
  },

  /**
   * Capture a thumbs up/down rating for a previously-watched title.
   */
  setEnjoyed: async (
    householdId: string,
    watchedId: string,
    enjoyed: boolean
  ): Promise<{ entry: HistoryEntry }> => {
    return fetchWithAuth(
      `/api/households/${householdId}/history/${watchedId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ enjoyed }),
      }
    );
  },
};
