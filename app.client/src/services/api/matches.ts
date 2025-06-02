// filepath: c:\Users\thete\Desktop\localdev\pairflix\frontend\src\services\api\matches.ts
import { fetchWithAuth } from './utils';

export interface RecommendedContent {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster_path?: string;
	overview?: string;
	recommendation_score: number;
	recommendation_reason: string;
}

export const matches = {
	getAll: async () => {
		return fetchWithAuth('/api/matches');
	},

	// Add create method
	create: async (userId: string) => {
		return fetchWithAuth('/api/matches', {
			method: 'POST',
			body: JSON.stringify({ user2_id: userId }),
		});
	},

	request: async (email: string) => {
		return fetchWithAuth('/api/matches/request', {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
	},

	updateStatus: async (match_id: string, status: 'accepted' | 'rejected') => {
		return fetchWithAuth(`/api/matches/${match_id}`, {
			method: 'PUT',
			body: JSON.stringify({ status }),
		});
	},

	// New method for getting personalized recommendations
	getRecommendations: async (limit = 6): Promise<RecommendedContent[]> => {
		return fetchWithAuth(`/api/recommendations?limit=${limit}`);
	},
};
