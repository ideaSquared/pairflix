/**
 * Admin statistics service
 * Provides centralized access to admin statistics with caching
 */
import { apiService } from './api.service';

export class AdminStatsService {
	private cache = {
		dashboardStats: null as any,
		systemMetrics: null as any,
		systemStats: null as any,
		activityStats: null as any,
		lastFetched: {
			dashboardStats: 0,
			systemMetrics: 0,
			systemStats: 0,
			activityStats: 0,
		},
	};

	// Cache TTL in milliseconds
	private TTL = 60 * 1000; // 1 minute default TTL

	/**
	 * Check if cached data is still valid
	 */
	private isCacheValid(key: keyof typeof this.cache.lastFetched): boolean {
		const lastFetched = this.cache.lastFetched[key];
		return lastFetched > 0 && Date.now() - lastFetched < this.TTL;
	}

	/**
	 * Update cache with new data
	 */
	private updateCache<T>(key: string, data: T): T {
		(this.cache as any)[key] = data;
		(this.cache.lastFetched as any)[key] = Date.now();
		return data;
	}

	/**
	 * Set custom cache TTL
	 */
	setTTL(milliseconds: number): void {
		this.TTL = milliseconds;
	}

	/**
	 * Get dashboard statistics (overview)
	 */
	async getDashboardStats(forceRefresh = false): Promise<any> {
		if (
			!forceRefresh &&
			this.isCacheValid('dashboardStats') &&
			this.cache.dashboardStats
		) {
			return this.cache.dashboardStats;
		}

		try {
			const response = await apiService.get('/api/admin/dashboard-stats');
			return this.updateCache('dashboardStats', response.stats);
		} catch (error) {
			console.error('Error fetching dashboard stats:', error);
			throw error;
		}
	}

	/**
	 * Get system metrics
	 */
	async getSystemMetrics(forceRefresh = false): Promise<any> {
		if (
			!forceRefresh &&
			this.isCacheValid('systemMetrics') &&
			this.cache.systemMetrics
		) {
			return this.cache.systemMetrics;
		}

		const response = await apiService.get('/api/admin/system-metrics');
		return this.updateCache('systemMetrics', response.metrics);
	}

	/**
	 * Get detailed system statistics
	 */
	async getSystemStats(forceRefresh = false): Promise<any> {
		if (
			!forceRefresh &&
			this.isCacheValid('systemStats') &&
			this.cache.systemStats
		) {
			return this.cache.systemStats;
		}

		const response = await apiService.get('/api/admin/system-stats');
		return this.updateCache('systemStats', response);
	}

	/**
	 * Get user activity statistics
	 */
	async getUserActivityStats(days = 7, forceRefresh = false): Promise<any> {
		const cacheKey = 'activityStats';

		if (
			!forceRefresh &&
			this.isCacheValid(cacheKey) &&
			this.cache.activityStats
		) {
			return this.cache.activityStats;
		}

		const queryParams: Record<string, string> = {};
		if (days) queryParams.days = days.toString();

		const response = await apiService.get(
			'/api/admin/user-activity-stats',
			queryParams
		);
		return this.updateCache(cacheKey, response);
	}

	/**
	 * Clear all cached data
	 */
	clearCache(): void {
		this.cache = {
			dashboardStats: null,
			systemMetrics: null,
			systemStats: null,
			activityStats: null,
			lastFetched: {
				dashboardStats: 0,
				systemMetrics: 0,
				systemStats: 0,
				activityStats: 0,
			},
		};
	}
}

// Create and export singleton instance
export const adminStatsService = new AdminStatsService();
