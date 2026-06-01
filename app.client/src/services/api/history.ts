import { fetchWithAuth } from './utils';

export interface HistoryEntry {
  id: string;
  household_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  watched_at: string;
  enjoyed: boolean | null;
  title: string | null;
  year: number | null;
  poster_path: string | null;
}

export interface HistoryResponse {
  history: HistoryEntry[];
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
