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

export interface AuditLog {
	log_id: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	source: string;
	context: any;
	created_at: string;
}

export interface AuditLogStats {
	total: number;
	byLevel: {
		info?: number;
		warn?: number;
		error?: number;
		debug?: number;
	};
	oldestLog: string | null;
	newestLog: string | null;
}

export interface PaginatedResponse<T> {
	logs: T[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

// New interfaces for admin dashboard
export interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalMatches: number;
	watchlistEntries: number;
}

export interface SystemStats {
	server: {
		uptime: number;
		memory: {
			total: number;
			used: number;
			free: number;
		};
		cpu: {
			usage: number;
			cores: number;
		};
		storage: {
			total: number;
			used: number;
			free: number;
		};
	};
	database: {
		connections: number;
		queriesPerSecond: number;
		size: number;
		tables: {
			name: string;
			rows: number;
			size: number;
		}[];
	};
	application: {
		activeUsers: number;
		activeUsersTrend: 'up' | 'down' | 'neutral';
		requestsPerMinute: number;
		requestsPerMinuteTrend: 'up' | 'down' | 'neutral';
		averageResponseTime: number;
		averageResponseTimeTrend: 'up' | 'down' | 'neutral';
		errorRate: number;
		errorRateTrend: 'up' | 'down' | 'neutral';
	};
}

export interface AdminUser {
	user_id: string;
	username: string;
	email: string;
	role: 'admin' | 'user' | 'moderator';
	status: 'active' | 'inactive' | 'suspended';
	created_at: string;
	last_login?: string;
	preferences: {
		theme: 'light' | 'dark';
		emailNotifications: boolean;
		[key: string]: any;
	};
}

export interface AppSettings {
	general: {
		siteName: string;
		siteDescription: string;
		maintenanceMode: boolean;
		defaultUserRole: string;
	};
	security: {
		sessionTimeout: number;
		maxLoginAttempts: number;
		passwordPolicy: {
			minLength: number;
			requireUppercase: boolean;
			requireLowercase: boolean;
			requireNumbers: boolean;
			requireSpecialChars: boolean;
		};
		twoFactorAuth: {
			enabled: boolean;
			requiredForAdmins: boolean;
		};
	};
	email: {
		smtpServer: string;
		smtpPort: number;
		smtpUsername: string;
		smtpPassword: string;
		senderEmail: string;
		senderName: string;
		emailTemplatesPath: string;
	};
	media: {
		maxUploadSize: number;
		allowedFileTypes: string[];
		imageQuality: number;
		storageProvider: string;
	};
	features: {
		enableMatching: boolean;
		enableUserProfiles: boolean;
		enableNotifications: boolean;
		enableActivityFeed: boolean;
	};
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
	logout: async () => {
		try {
			// Call the logout endpoint to record the event in audit logs
			await fetchWithAuth('/api/auth/logout', {
				method: 'POST',
			});
		} catch (error) {
			// If there's an error logging out, we still want to clear local storage
			console.error('Error logging out:', error);
		}
		// Remove token from localStorage regardless of server response
		localStorage.removeItem('token');
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

export const admin = {
	// Existing audit log methods
	getAuditLogs: async (
		params: {
			limit?: number;
			offset?: number;
			source?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<PaginatedResponse<AuditLog>> => {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.source) queryParams.append('source', params.source);
		if (params.startDate) queryParams.append('startDate', params.startDate);
		if (params.endDate) queryParams.append('endDate', params.endDate);

		return fetchWithAuth(`/api/admin/audit-logs?${queryParams.toString()}`);
	},

	getAuditLogsByLevel: async (
		level: string,
		params: {
			limit?: number;
			offset?: number;
			source?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<PaginatedResponse<AuditLog>> => {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.source) queryParams.append('source', params.source);
		if (params.startDate) queryParams.append('startDate', params.startDate);
		if (params.endDate) queryParams.append('endDate', params.endDate);

		return fetchWithAuth(
			`/api/admin/audit-logs/${level}?${queryParams.toString()}`
		);
	},

	getLogSources: async (): Promise<{ sources: string[] }> => {
		return fetchWithAuth('/api/admin/audit-logs-sources');
	},

	getAuditLogStats: async (): Promise<{ stats: AuditLogStats }> => {
		return fetchWithAuth('/api/admin/audit-logs-stats');
	},

	runLogRotation: async (customRetention?: {
		info?: number;
		warn?: number;
		error?: number;
		debug?: number;
	}): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth('/api/admin/audit-logs-rotation', {
			method: 'POST',
			body: JSON.stringify({
				retentionDays: customRetention,
			}),
		});
	},

	createTestLog: async (data: { level: string; message: string }) => {
		return fetchWithAuth('/api/admin/audit-logs/test', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	},

	// New admin dashboard methods
	getDashboardStats: async (): Promise<{ stats: DashboardStats }> => {
		// This would call a new endpoint to get overall dashboard stats
		return fetchWithAuth('/api/admin/dashboard-stats');
	},

	// User management methods
	getUsers: async (
		params: {
			limit?: number;
			offset?: number;
			search?: string;
			status?: string;
			role?: string;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
		} = {}
	): Promise<{
		users: AdminUser[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	}> => {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.search) queryParams.append('search', params.search);
		if (params.status) queryParams.append('status', params.status);
		if (params.role) queryParams.append('role', params.role);
		if (params.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		return fetchWithAuth(`/api/admin/users?${queryParams.toString()}`);
	},

	getUser: async (userId: string): Promise<{ user: AdminUser }> => {
		return fetchWithAuth(`/api/admin/users/${userId}`);
	},

	createUser: async (userData: {
		username: string;
		email: string;
		password: string;
		role: string;
		status: string;
	}): Promise<{ user: AdminUser; message: string }> => {
		return fetchWithAuth('/api/admin/users', {
			method: 'POST',
			body: JSON.stringify(userData),
		});
	},

	updateUser: async (
		userId: string,
		updates: {
			username?: string;
			email?: string;
			password?: string;
			role?: string;
			status?: string;
		}
	): Promise<{ user: AdminUser; message: string }> => {
		return fetchWithAuth(`/api/admin/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(updates),
		});
	},

	// System stats methods
	getSystemStats: async (): Promise<{ stats: SystemStats }> => {
		return fetchWithAuth('/api/admin/system-stats');
	},

	// App settings methods
	getAppSettings: async (): Promise<{ settings: AppSettings }> => {
		return fetchWithAuth('/api/admin/settings');
	},

	updateAppSettings: async (
		settings: AppSettings
	): Promise<{ settings: AppSettings; message: string }> => {
		return fetchWithAuth('/api/admin/settings', {
			method: 'PUT',
			body: JSON.stringify({ settings }),
		});
	},

	deleteUser: async (
		userId: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/users/${userId}`, {
			method: 'DELETE',
		});
	},
};

// Create and export a default api object that combines all services
const api = {
	auth,
	user,
	search,
	watchlist,
	matches,
	admin,
};

export default api;
