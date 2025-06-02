// Admin statistics service for frontend
import { fetchWithAuth } from './api';
import {
	ActivityStats,
	DashboardStats,
	SystemMetrics,
	SystemStats,
} from './api/admin';

/**
 * AdminStatsService - A centralized service for admin statistics
 * This eliminates duplication across components by providing a single source for stats data
 * and implements client-side caching to reduce redundant API calls
 */
export class AdminStatsService {
	private cache = {
		dashboardStats: null as DashboardStats | null,
		systemMetrics: null as SystemMetrics | null,
		systemStats: null as SystemStats | null,
		activityStats: null as ActivityStats | null,
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
	async getDashboardStats(forceRefresh = false): Promise<DashboardStats> {
		if (
			!forceRefresh &&
			this.isCacheValid('dashboardStats') &&
			this.cache.dashboardStats
		) {
			return this.cache.dashboardStats;
		}

		const response = await fetchWithAuth<{ stats: DashboardStats }>(
			'/api/admin/dashboard-stats'
		);
		return this.updateCache('dashboardStats', response.stats);
	}

	/**
	 * Get system metrics
	 */
	async getSystemMetrics(forceRefresh = false): Promise<SystemMetrics> {
		if (
			!forceRefresh &&
			this.isCacheValid('systemMetrics') &&
			this.cache.systemMetrics
		) {
			return this.cache.systemMetrics;
		}

		const response = await fetchWithAuth<{ metrics: SystemMetrics }>(
			'/api/admin/system-metrics'
		);
		return this.updateCache('systemMetrics', response.metrics);
	}

	/**
	 * Get detailed system statistics
	 */
	async getSystemStats(forceRefresh = false): Promise<SystemStats> {
		if (
			!forceRefresh &&
			this.isCacheValid('systemStats') &&
			this.cache.systemStats
		) {
			return this.cache.systemStats;
		}

		const response = await fetchWithAuth<SystemStats>(
			'/api/admin/system-stats'
		);
		return this.updateCache('systemStats', response);
	}

	/**
	 * Get user activity statistics
	 */ async getUserActivityStats(
		days = 7,
		forceRefresh = false
	): Promise<ActivityStats> {
		const cacheKey = 'activityStats';

		if (
			!forceRefresh &&
			this.isCacheValid(cacheKey) &&
			this.cache.activityStats
		) {
			return this.cache.activityStats;
		}

		const queryParams = new URLSearchParams();
		if (days) queryParams.append('days', days.toString());

		const response = await fetchWithAuth<{ stats: ActivityStats }>(
			`/api/admin/user-activity-stats?${queryParams.toString()}`
		);
		return this.updateCache(cacheKey, response.stats);
	}

	/**
	 * Clear all cached data
	 */ clearCache(): void {
		this.cache = {
			dashboardStats: null as DashboardStats | null,
			systemMetrics: null as SystemMetrics | null,
			systemStats: null as SystemStats | null,
			activityStats: null as ActivityStats | null,
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
