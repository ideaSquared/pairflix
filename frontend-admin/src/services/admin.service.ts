import { API_BASE_URL } from '../config';

// Types
export interface ActivityLog {
	id: string;
	timestamp: string;
	userId: string;
	userEmail?: string;
	action: string;
	entityType: string;
	entityId: string;
	details: string;
}

export interface AuditLog {
	id: string;
	timestamp: string;
	adminId: string;
	adminName: string;
	action: string;
	targetType: string;
	targetId: string;
	details: any;
	changes: Record<string, any>;
	reason?: string;
	ipAddress: string;
}

export interface SystemMetrics {
	cpu: {
		usage: number;
		cores: number;
	};
	memory: {
		total: number;
		used: number;
		free: number;
	};
	storage: {
		total: number;
		used: number;
		free: number;
	};
	uptime: number;
	activeUsers: number;
	requestsPerMinute: number;
	averageResponseTime: number;
	errorRate: number;
}

export interface ApiEndpointStats {
	endpoint: string;
	method: string;
	requestCount: number;
	averageResponseTime: number;
	errorCount: number;
	errorRate: number;
}

export interface UserStats {
	totalUsers: number;
	activeUsers: number;
	newUsersToday: number;
	newUsersThisWeek: number;
	newUsersThisMonth: number;
	retentionRate: number;
	averageSessionDuration: number;
	usersByPlatform: Record<string, number>;
}

export interface ContentStats {
	totalMatches: number;
	matchesCreatedToday: number;
	averageMatchesPerUser: number;
	mostMatchedGenres: Array<{ genre: string; count: number }>;
	mostMatchedMovies: Array<{ movieId: string; title: string; count: number }>;
}

export interface AppSettings {
	id: string;
	key: string;
	value: any;
	description: string;
	category: string;
	lastUpdated: string;
	updatedBy: string;
}

export interface AdminStats {
	users: UserStats;
	content: ContentStats;
	system: {
		todayApiCalls: number;
		weeklyApiCalls: number;
		monthlyApiCalls: number;
	};
}

export interface AdminService {
	getActivityLogs: (filters?: any) => Promise<{
		logs: ActivityLog[];
		pagination: {
			totalCount: number;
			totalPages: number;
			currentPage: number;
			pageSize: number;
		};
	}>;
	getAuditLogs: (filters?: any) => Promise<{
		logs: AuditLog[];
		pagination: {
			total: number;
			totalPages: number;
			currentPage: number;
			pageSize: number;
		};
	}>;
	exportActivityLogs: (filters?: any) => Promise<{ jobId: string }>;
	exportAuditLogs: (filters?: any) => Promise<{ jobId: string }>;
	getSystemMetrics: () => Promise<SystemMetrics>;
	getApiEndpointStats: () => Promise<ApiEndpointStats[]>;
	getDashboardStats: () => Promise<AdminStats>;
	getAppSettings: () => Promise<AppSettings[]>;
	updateAppSetting: (
		id: string,
		value: any,
		reason: string
	) => Promise<AppSettings>;
	addAppSetting: (
		setting: Omit<AppSettings, 'id' | 'lastUpdated' | 'updatedBy'>
	) => Promise<AppSettings>;
	deleteAppSetting: (id: string, reason: string) => Promise<void>;
	getSystemStats: (options: { range: string }) => Promise<any>;
	getContent: (filters: any) => Promise<{
		content: any[];
		pagination: {
			total: number;
		};
	}>;
	updateContent: (id: string, data: any) => Promise<any>;
	removeContent: (id: string, reason: string) => Promise<void>;
	flagContent: (id: string) => Promise<void>;
	approveContent: (id: string) => Promise<void>;
	getContentReports: (contentId: string) => Promise<{ reports: any[] }>;
	dismissReport: (reportId: string) => Promise<void>;
	getAuditLogActions: () => Promise<{ actions: string[] }>;
	getAuditLogTargetTypes: () => Promise<{ targetTypes: string[] }>;
	getActivityLogActions: () => Promise<{ actions: string[] }>;
	getActivityLogEntityTypes: () => Promise<{ entityTypes: string[] }>;
	clearCache: () => Promise<{ success: boolean; message: string }>;
}

/**
 * AdminApiService handles all admin API requests
 * Using native fetch API instead of axios
 */
class AdminApiService implements AdminService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = `${API_BASE_URL}/admin`;
	}

	private getAuthHeader(): Headers {
		const token = localStorage.getItem('admin_token');
		const headers = new Headers({
			'Content-Type': 'application/json',
		});

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		return headers;
	}

	private async handleRequest<T>(
		url: string,
		options: RequestInit
	): Promise<T> {
		const response = await fetch(url, {
			...options,
			credentials: 'include',
		});

		if (!response.ok) {
			// Handle 401 unauthorized errors
			if (response.status === 401) {
				localStorage.removeItem('admin_token');
				window.location.href = '/login';
			}

			// Handle other errors
			let errorMessage = 'API request failed';
			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorData.message || errorMessage;
			} catch (e) {
				errorMessage = response.statusText || errorMessage;
			}

			throw new Error(errorMessage);
		}

		return response.json();
	}

	private buildUrl(endpoint: string, params?: Record<string, any>): string {
		const url = new URL(`${this.baseUrl}${endpoint}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		return url.toString();
	}

	async getActivityLogs(filters = {}): Promise<{
		logs: ActivityLog[];
		pagination: {
			totalCount: number;
			totalPages: number;
			currentPage: number;
			pageSize: number;
		};
	}> {
		return this.handleRequest(this.buildUrl('/logs/activity', filters), {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getAuditLogs(filters = {}): Promise<{
		logs: AuditLog[];
		pagination: {
			total: number;
			totalPages: number;
			currentPage: number;
			pageSize: number;
		};
	}> {
		return this.handleRequest(this.buildUrl('/logs/audit', filters), {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async exportActivityLogs(filters = {}): Promise<{ jobId: string }> {
		return this.handleRequest(`${this.baseUrl}/logs/activity/export`, {
			method: 'POST',
			headers: this.getAuthHeader(),
			body: JSON.stringify(filters),
		});
	}

	async exportAuditLogs(filters = {}): Promise<{ jobId: string }> {
		return this.handleRequest(`${this.baseUrl}/logs/audit/export`, {
			method: 'POST',
			headers: this.getAuthHeader(),
			body: JSON.stringify(filters),
		});
	}

	async getSystemMetrics(): Promise<SystemMetrics> {
		return this.handleRequest(`${this.baseUrl}/system/metrics`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getApiEndpointStats(): Promise<ApiEndpointStats[]> {
		return this.handleRequest(`${this.baseUrl}/system/api-stats`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getDashboardStats(): Promise<AdminStats> {
		return this.handleRequest(`${this.baseUrl}/dashboard/stats`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getAppSettings(): Promise<AppSettings[]> {
		return this.handleRequest(`${this.baseUrl}/settings`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async updateAppSetting(
		id: string,
		value: any,
		reason: string
	): Promise<AppSettings> {
		return this.handleRequest(`${this.baseUrl}/settings/${id}`, {
			method: 'PUT',
			headers: this.getAuthHeader(),
			body: JSON.stringify({ value, reason }),
		});
	}

	async addAppSetting(
		setting: Omit<AppSettings, 'id' | 'lastUpdated' | 'updatedBy'>
	): Promise<AppSettings> {
		return this.handleRequest(`${this.baseUrl}/settings`, {
			method: 'POST',
			headers: this.getAuthHeader(),
			body: JSON.stringify(setting),
		});
	}

	async deleteAppSetting(id: string, reason: string): Promise<void> {
		return this.handleRequest(`${this.baseUrl}/settings/${id}`, {
			method: 'DELETE',
			headers: this.getAuthHeader(),
			body: JSON.stringify({ reason }),
		});
	}

	async getSystemStats(options: { range: string }): Promise<any> {
		return this.handleRequest(this.buildUrl('/system/stats', options), {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getContent(filters: any): Promise<{
		content: any[];
		pagination: {
			total: number;
		};
	}> {
		return this.handleRequest(this.buildUrl('/content', filters), {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async updateContent(id: string, data: any): Promise<any> {
		return this.handleRequest(`${this.baseUrl}/content/${id}`, {
			method: 'PUT',
			headers: this.getAuthHeader(),
			body: JSON.stringify(data),
		});
	}

	async removeContent(id: string, reason: string): Promise<void> {
		return this.handleRequest(`${this.baseUrl}/content/${id}`, {
			method: 'DELETE',
			headers: this.getAuthHeader(),
			body: JSON.stringify({ reason }),
		});
	}

	async flagContent(id: string): Promise<void> {
		return this.handleRequest(`${this.baseUrl}/content/${id}/flag`, {
			method: 'POST',
			headers: this.getAuthHeader(),
		});
	}

	async approveContent(id: string): Promise<void> {
		return this.handleRequest(`${this.baseUrl}/content/${id}/approve`, {
			method: 'POST',
			headers: this.getAuthHeader(),
		});
	}

	async getContentReports(contentId: string): Promise<{ reports: any[] }> {
		return this.handleRequest(`${this.baseUrl}/content/${contentId}/reports`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async dismissReport(reportId: string): Promise<void> {
		return this.handleRequest(`${this.baseUrl}/reports/${reportId}/dismiss`, {
			method: 'POST',
			headers: this.getAuthHeader(),
		});
	}

	async getAuditLogActions(): Promise<{ actions: string[] }> {
		return this.handleRequest(`${this.baseUrl}/logs/audit/actions`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getAuditLogTargetTypes(): Promise<{ targetTypes: string[] }> {
		return this.handleRequest(`${this.baseUrl}/logs/audit/target-types`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getActivityLogActions(): Promise<{ actions: string[] }> {
		return this.handleRequest(`${this.baseUrl}/logs/activity/actions`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async getActivityLogEntityTypes(): Promise<{ entityTypes: string[] }> {
		return this.handleRequest(`${this.baseUrl}/logs/activity/entity-types`, {
			method: 'GET',
			headers: this.getAuthHeader(),
		});
	}

	async clearCache(): Promise<{ success: boolean; message: string }> {
		return this.handleRequest(`${this.baseUrl}/cache/clear`, {
			method: 'POST',
			headers: this.getAuthHeader(),
		});
	}
}

// Export singleton instance
export const adminService: AdminService = new AdminApiService();
