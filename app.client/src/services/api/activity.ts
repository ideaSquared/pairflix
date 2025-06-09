import { fetchWithAuth } from './utils';

export interface Activity {
  id: string;
  userId: string;
  type: 'added' | 'updated' | 'rated' | 'completed' | 'note';
  contentId: string;
  contentTitle: string;
  contentMediaType: 'movie' | 'tv';
  details: {
    status?: 'to_watch' | 'watching' | 'finished';
    rating?: number;
    note?: string;
    tags?: string[];
  };
  timestamp: string;
  userDisplayName: string;
}

export const activity = {
  /**
   * Get recent activities from partner user
   */
  getRecent: async (limit = 20): Promise<Activity[]> => {
    return fetchWithAuth(`/api/activities?limit=${limit}`);
  },

  /**
   * Get activities related to a specific content
   */
  getForContent: async (contentId: string): Promise<Activity[]> => {
    return fetchWithAuth(`/api/activities/content/${contentId}`);
  },
};
