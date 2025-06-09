// filepath: c:\Users\thete\Desktop\localdev\pairflix\frontend\src\services\api\watchlist.ts
import { fetchWithAuth, WatchlistEntry } from './utils';

export const watchlist = {
  getAll: async () => {
    return fetchWithAuth('/api/watchlist');
  },

  add: async (entry: {
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    status: WatchlistEntry['status'];
  }) => {
    return fetchWithAuth('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  update: async (entry_id: string, updates: Partial<WatchlistEntry>) => {
    return fetchWithAuth(`/api/watchlist/${entry_id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getMatches: async () => {
    return fetchWithAuth('/api/watchlist/matches');
  },
};
