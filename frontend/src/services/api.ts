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
	user_id: string;
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
	created_at: Date;
	updated_at: Date;
	tmdb_status?: string;
	title?: string;
	overview?: string;
	poster_path?: string;
}

export interface SearchResult {
	id: number;
	title?: string;
	name?: string;
	media_type: 'movie' | 'tv';
	poster_path: string | null;
	overview: string;
}

export interface SearchResponse {
	page: number;
	results: SearchResult[];
	total_pages: number;
	total_results: number;
}

export interface Match {
	match_id: string;
	user1_id: string;
	user2_id: string;
	status: 'pending' | 'accepted' | 'rejected';
	created_at: Date;
	updated_at: Date;
	user1?: { email: string };
	user2?: { email: string };
}

export interface ContentMatch {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster_path?: string;
	overview?: string;
	user1_status: WatchlistEntry['status'];
	user2_status: WatchlistEntry['status'];
}

interface PasswordUpdate {
	currentPassword: string;
	newPassword: string;
}

interface EmailUpdate {
	email: string;
	password: string;
}

interface UpdateUsernameData {
	username: string;
	password: string;
}

interface UpdateUsernameResponse {
	message: string;
	user: {
		user_id: string;
		email: string;
		username: string;
	};
	token: string;
}

interface UpdateEmailResponse {
	message: string;
	user: {
		user_id: string;
		email: string;
		username: string;
	};
	token: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
	const token = localStorage.getItem('token');
	const headers = new Headers({
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
		...options.headers,
	});

	try {
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
			const contentType = response.headers.get('content-type');
			let error = { error: 'An error occurred' };

			if (contentType && contentType.includes('application/json')) {
				error = await response
					.json()
					.catch(() => ({ error: 'An error occurred' }));
			}

			throw new Error(error.error || 'An error occurred');
		}

		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			throw new Error('Invalid response format');
		}

		return response.json();
	} catch (error) {
		console.error('API request failed:', error);
		throw error instanceof Error ? error : new Error('Network request failed');
	}
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

export const user = {
	updatePassword: async (data: PasswordUpdate) => {
		return fetchWithAuth('/api/user/password', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},
	updateEmail: async (data: EmailUpdate): Promise<UpdateEmailResponse> => {
		return fetchWithAuth('/api/user/email', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},
	updateUsername: async (data: { username: string }): Promise<UpdateUsernameResponse> => {
		return fetchWithAuth('/api/user/username', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},
	findByEmail: async (email: string) => {
		return fetchWithAuth(`/api/user/search?email=${encodeURIComponent(email)}`);
	},
};

export const search = {
	media: async (query: string): Promise<SearchResult[]> => {
		const response = (await fetchWithAuth(
			`/api/search/media?query=${encodeURIComponent(query)}`
		)) as SearchResponse;
		return response.results || [];
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
