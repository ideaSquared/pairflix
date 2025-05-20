import { fetchWithAuth, PaginatedResponse } from './utils';

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

export interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalMatches: number;
	watchlistEntries: number;
}

export interface SystemStats {
	timestamp: Date;
	database: {
		totalUsers: number;
		newUsers: {
			lastDay: number;
			lastWeek: number;
			lastMonth: number;
		};
		activeUsers: number;
		inactivePercentage: number;
		contentStats: {
			watchlistEntries: number;
			matches: number;
			averageWatchlistPerUser: number;
		};
		errorCount: number;
		size: {
			bytes: number;
			megabytes: number;
		};
	};
	system: {
		os: {
			type: string;
			platform: string;
			arch: string;
			release: string;
			uptime: number;
			loadAvg: number[];
		};
		memory: {
			total: number;
			free: number;
			usagePercent: number;
		};
		cpu: {
			cores: number;
			model: string;
			speed: number;
		};
		process: {
			uptime: number;
			memoryUsage: any;
			nodeVersion: string;
			pid: number;
		};
	};
}

export interface AdminUser {
	user_id: string;
	username: string;
	email: string;
	role: 'admin' | 'user' | 'moderator';
	status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
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

export const admin = {
	// Audit log methods
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

	// Dashboard stats methods
	getDashboardStats: async (): Promise<{ stats: DashboardStats }> => {
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

	deleteUser: async (
		userId: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/users/${userId}`, {
			method: 'DELETE',
		});
	},

	changeUserStatus: async (
		userId: string,
		status: 'active' | 'inactive' | 'suspended' | 'pending' | 'banned',
		reason?: string
	): Promise<{
		success: boolean;
		message: string;
		user: AdminUser;
	}> => {
		return fetchWithAuth(`/api/admin/users/${userId}/status`, {
			method: 'PUT',
			body: JSON.stringify({ status, reason }),
		});
	},

	resetUserPassword: async (
		userId: string
	): Promise<{
		success: boolean;
		message: string;
		newPassword: string;
		user: {
			user_id: string;
			username: string;
			email: string;
		};
	}> => {
		return fetchWithAuth(`/api/admin/users/${userId}/reset-password`, {
			method: 'POST',
		});
	},

	exportUsersAsCsv: async (
		params: {
			role?: string;
			status?: string;
		} = {}
	): Promise<Blob> => {
		const queryParams = new URLSearchParams();
		if (params.role) queryParams.append('role', params.role);
		if (params.status) queryParams.append('status', params.status);

		// Use fetch directly for blob response
		const token = localStorage.getItem('token');
		const headers = new Headers({
			'Content-Type': 'application/json',
		});

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const response = await fetch(
			`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users-csv?${queryParams.toString()}`,
			{ headers }
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || error.message || 'An error occurred');
		}

		return response.blob();
	},

	// System stats methods
	getSystemStats: async (): Promise<{ [key: string]: any }> => {
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

	// Content management methods
	getAllWatchlistEntries: async (
		params: {
			limit?: number;
			offset?: number;
			userId?: string;
			status?: string;
			mediaType?: string;
		} = {}
	) => {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.userId) queryParams.append('userId', params.userId);
		if (params.status) queryParams.append('status', params.status);
		if (params.mediaType) queryParams.append('mediaType', params.mediaType);

		return fetchWithAuth(
			`/api/admin/watchlist-entries?${queryParams.toString()}`
		);
	},

	moderateWatchlistEntry: async (params: {
		entryId: string;
		action: 'flag' | 'remove' | 'approve';
		reason?: string;
	}) => {
		return fetchWithAuth(
			`/api/admin/watchlist-entries/${params.entryId}/moderate`,
			{
				method: 'PUT',
				body: JSON.stringify({
					action: params.action,
					reason: params.reason,
				}),
			}
		);
	},

	getAllMatches: async (
		params: {
			limit?: number;
			offset?: number;
			userId?: string;
			status?: string;
		} = {}
	) => {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.userId) queryParams.append('userId', params.userId);
		if (params.status) queryParams.append('status', params.status);

		return fetchWithAuth(`/api/admin/matches?${queryParams.toString()}`);
	},

	// System monitoring methods
	getSystemMetrics: async () => {
		return fetchWithAuth('/api/admin/system-metrics');
	},

	getUserActivityStats: async (params: { days?: number } = {}) => {
		const queryParams = new URLSearchParams();
		if (params.days) queryParams.append('days', params.days.toString());

		return fetchWithAuth(
			`/api/admin/user-activity-stats?${queryParams.toString()}`
		);
	},

	// Content management methods
	getContent: async (
		params: {
			limit?: number;
			offset?: number;
			search?: string;
			type?: string;
			status?: string;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
		} = {}
	): Promise<{
		content: any[];
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
		if (params.type) queryParams.append('type', params.type);
		if (params.status) queryParams.append('status', params.status);
		if (params.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		return fetchWithAuth(`/api/admin/content?${queryParams.toString()}`);
	},

	removeContent: async (
		contentId: string,
		reason: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/content/${contentId}/remove`, {
			method: 'PUT',
			body: JSON.stringify({ reason }),
		});
	},

	updateContent: async (
		contentId: string,
		updates: {
			title?: string;
			status?: string;
		}
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/content/${contentId}`, {
			method: 'PUT',
			body: JSON.stringify(updates),
		});
	},

	getContentReports: async (contentId: string): Promise<{ reports: any[] }> => {
		return fetchWithAuth(`/api/admin/content/${contentId}/reports`);
	},

	dismissReport: async (
		reportId: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/reports/${reportId}/dismiss`, {
			method: 'PUT',
		});
	},

	approveContent: async (
		contentId: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/content/${contentId}/approve`, {
			method: 'PUT',
		});
	},

	flagContent: async (
		contentId: string
	): Promise<{ success: boolean; message: string }> => {
		return fetchWithAuth(`/api/admin/content/${contentId}/flag`, {
			method: 'PUT',
		});
	},

	getUserActivities: async (
		params: {
			limit?: number;
			offset?: number;
			action?: string;
			userId?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<{
		activities: any[];
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
		if (params.action) queryParams.append('action', params.action);
		if (params.startDate) queryParams.append('startDate', params.startDate);
		if (params.endDate) queryParams.append('endDate', params.endDate);

		// For the admin dashboard showing ALL activities across the site
		if (!params.userId || params.userId === 'undefined') {
			return fetchWithAuth(
				`/api/admin/all-activities?${queryParams.toString()}`
			);
		}

		// When looking at a specific user's activities
		return fetchWithAuth(
			`/api/activity/user/${params.userId}?${queryParams.toString()}`
		);
	},
};
