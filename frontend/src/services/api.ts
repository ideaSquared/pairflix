const BASE_URL =
	(import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

interface ApiError {
	error: string;
}

interface LoginCredentials {
	email: string;
	password: string;
}

export interface WatchlistEntry {
	entry_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status:
		| 'to_watch'
		| 'to_watch_together'
		| 'would_like_to_watch_together'
		| 'watching'
		| 'finished';
	rating?: number;
	notes?: string;
	title?: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
	const token = localStorage.getItem('token');
	const headers = new Headers({
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
		...options.headers,
	});

	console.log('Request headers:', Object.fromEntries(headers.entries()));

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers,
		credentials: 'include',
	});

	if (response.status === 401 || response.status === 403) {
		// Token is invalid or expired
		localStorage.removeItem('token');
		window.location.href = '/login';
		throw new Error('Authentication required');
	}

	if (!response.ok) {
		const error: ApiError = await response
			.json()
			.catch(() => ({ error: 'An error occurred' }));
		throw new Error(error.error || 'An error occurred');
	}

	return response.json();
}

export const auth = {
	login: async (credentials: LoginCredentials) => {
		const response = await fetchWithAuth('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
		if (response.token) {
			localStorage.setItem('token', response.token);
		}
		return response;
	},
};

export const watchlist = {
	getAll: async () => {
		return fetchWithAuth('/api/watchlist');
	},

	add: async (entry: Omit<WatchlistEntry, 'entry_id'>) => {
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
