import { fetchWithAuth } from './utils';

export interface Activity {
  log_id: string;
  user_id: string;
  action: string;
  context: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Include user information when fetched with user association
  user?: {
    user_id: string;
    username: string;
    email?: string;
  };
}

export const activity = {
  /**
   * Get recent activity feed (combined user and partner activities)
   */
  getRecent: async (limit = 20): Promise<{ activities: Activity[] }> => {
    return fetchWithAuth(`/api/activity/feed?limit=${limit}`);
  },

  /**
   * Get current user's own activities
   */
  getMyActivities: async (limit = 20): Promise<{ activities: Activity[] }> => {
    return fetchWithAuth(`/api/activity/me?limit=${limit}`);
  },

  /**
   * Get partner's activities
   */
  getPartnerActivities: async (
    limit = 20
  ): Promise<{ activities: Activity[] }> => {
    return fetchWithAuth(`/api/activity/partner?limit=${limit}`);
  },

  /**
   * Get activities related to a specific content
   */
  getForContent: async (contentId: string): Promise<Activity[]> => {
    return fetchWithAuth(`/api/activity/content/${contentId}`);
  },
};
