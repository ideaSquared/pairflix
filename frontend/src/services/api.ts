const BASE_URL =
	(import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

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

interface UpdateEmailResponse {
	message: string;
	user: {
		user_id: string;
		email: string;
		username: string;
	};
	token: string;
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

export interface User {
	id: string;
	username: string;
	email: string;
	preferences: UserPreferences;
}

export interface UserPreferences {
	theme: 'light' | 'dark';
	viewStyle: 'grid' | 'list';
	emailNotifications: boolean;
	autoArchiveDays: number;
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
	const headers = new Headers({
		'Content-Type': 'application/json',
		...Object.fromEntries(Object.entries(options.headers || {})),
	});

	const token = localStorage.getItem('token');
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	try {
		const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
		const response = await fetch(fullUrl, { ...options, headers });

		if (response.status === 401) {
			localStorage.removeItem('token');
			throw new Error('Authentication required');
		}

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || error.message || 'An error occurred');
		}

		return response.json();
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error('Network error occurred');
	}
};

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
	getCurrentUser: async () => {
		return fetchWithAuth('/api/auth/me');
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
	updateUsername: async (data: {
		username: string;
	}): Promise<UpdateUsernameResponse> => {
		return fetchWithAuth('/api/user/username', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},
	findByEmail: async (email: string) => {
		return fetchWithAuth(`/api/user/search?email=${encodeURIComponent(email)}`);
	},
	updatePreferences: async (preferences: {
		theme?: 'light' | 'dark';
		viewStyle?: 'list' | 'grid';
		emailNotifications?: boolean;
		autoArchiveDays?: number;
		favoriteGenres?: string[];
	}) => {
		return fetchWithAuth('/api/user/preferences', {
			method: 'PUT',
			body: JSON.stringify({ preferences }),
		});
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
