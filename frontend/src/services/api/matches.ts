// filepath: c:\Users\thete\Desktop\localdev\pairflix\frontend\src\services\api\matches.ts
import { fetchWithAuth } from './utils';

export const matches = {
	getAll: async () => {
		return fetchWithAuth('/api/matches');
	},

	create: async (user2_id: string) => {
		return fetchWithAuth('/api/matches', {
			method: 'POST',
			body: JSON.stringify({ user2_id }),
		});
	},

	updateStatus: async (match_id: string, status: 'accepted' | 'rejected') => {
		return fetchWithAuth(`/api/matches/${match_id}/status`, {
			method: 'PUT',
			body: JSON.stringify({ status }),
		});
	},
};
