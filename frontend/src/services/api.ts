import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface WatchlistEntry {
	entry_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status: 'to_watch' | 'watching' | 'finished';
	rating?: number;
	notes?: string;
}

export const auth = {
	login: async (credentials: LoginCredentials) => {
		const { data } = await api.post('/api/auth/login', credentials);
		return data;
	},
};

export const watchlist = {
	getAll: async () => {
		const { data } = await api.get('/api/watchlist');
		return data;
	},

	add: async (entry: Omit<WatchlistEntry, 'entry_id'>) => {
		const { data } = await api.post('/api/watchlist', entry);
		return data;
	},

	update: async (entry_id: string, updates: Partial<WatchlistEntry>) => {
		const { data } = await api.put(`/api/watchlist/${entry_id}`, updates);
		return data;
	},

	getMatches: async () => {
		const { data } = await api.get('/api/watchlist/matches');
		return data;
	},
};

export default api;
