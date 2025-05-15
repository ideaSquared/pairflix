import os from 'os';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../db/connection';
import ActivityLog from '../models/ActivityLog';
import AuditLog from '../models/AuditLog';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';

/**
 * Statistics service - centralized service for all admin statistics functionality
 * This eliminates duplication across controller functions by providing a single source for stats data
 */

// Interfaces for our statistics data
export interface UserStatistics {
	totalUsers: number;
	activeUsers: number;
	inactivePercentage?: number;
	newUsers?: {
		lastDay: number;
		lastWeek: number;
		lastMonth: number;
	};
}

export interface ContentStatistics {
	watchlistEntries: number;
	matches: number;
	averageWatchlistPerUser?: number;
}

export interface ActivityStatistics {
	last24Hours: number;
	lastWeek: number;
	activityByDate?: any[];
	activityByType?: any[];
	mostActiveUsers?: any[];
}

export interface SystemHealthStatistics {
	recentErrors: number;
	uptime: number;
	memoryUsage: any;
	os?: {
		type: string;
		platform: string;
		arch: string;
		release: string;
		uptime: number;
		loadAvg: number[];
	};
	memory?: {
		total: number;
		free: number;
		usagePercent: number;
	};
	cpu?: {
		cores: number;
		model: string;
		speed: number;
	};
	process?: {
		uptime: number;
		memoryUsage: any;
		nodeVersion: string;
		pid: number;
	};
	database?: {
		size: {
			bytes: number;
			megabytes: number;
		};
	};
}

export interface UnifiedStatistics {
	timestamp: Date;
	users: UserStatistics;
	content: ContentStatistics;
	activity: ActivityStatistics;
	system: SystemHealthStatistics;
}

export interface StatsOptions {
	includeDetailed?: boolean;
	activityDays?: number;
}

/**
 * Statistics Service class
 */
class StatisticsService {
	/**
	 * Get basic user statistics
	 */
	async getUserStats(): Promise<UserStatistics> {
		const now = new Date();
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(now.getMonth() - 1);

		const userCount = await User.count();
		const activeUserCount = await User.count({
			where: {
				last_login: {
					[Op.gte]: oneMonthAgo,
				},
			},
		});

		return {
			totalUsers: userCount,
			activeUsers: activeUserCount,
			inactivePercentage:
				userCount > 0 ? ((userCount - activeUserCount) / userCount) * 100 : 0,
		};
	}

	/**
	 * Get detailed user statistics with new user counts
	 */
	async getDetailedUserStats(): Promise<UserStatistics> {
		const now = new Date();

		const oneDayAgo = new Date(now);
		oneDayAgo.setDate(now.getDate() - 1);

		const oneWeekAgo = new Date(now);
		oneWeekAgo.setDate(now.getDate() - 7);

		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(now.getMonth() - 1);

		const [
			userCount,
			newUsersLastDay,
			newUsersLastWeek,
			newUsersLastMonth,
			activeUserCount,
		] = await Promise.all([
			User.count(),
			User.count({ where: { created_at: { [Op.gte]: oneDayAgo } } }),
			User.count({ where: { created_at: { [Op.gte]: oneWeekAgo } } }),
			User.count({ where: { created_at: { [Op.gte]: oneMonthAgo } } }),
			User.count({ where: { last_login: { [Op.gte]: oneWeekAgo } } }),
		]);

		return {
			totalUsers: userCount,
			activeUsers: activeUserCount,
			inactivePercentage:
				userCount > 0
					? Math.round(((userCount - activeUserCount) / userCount) * 1000) / 10
					: 0,
			newUsers: {
				lastDay: newUsersLastDay,
				lastWeek: newUsersLastWeek,
				lastMonth: newUsersLastMonth,
			},
		};
	}

	/**
	 * Get content statistics
	 */
	async getContentStats(): Promise<ContentStatistics> {
		const [watchlistCount, matchCount, userCount] = await Promise.all([
			WatchlistEntry.count(),
			Match.count(),
			User.count(),
		]);

		return {
			watchlistEntries: watchlistCount,
			matches: matchCount,
			averageWatchlistPerUser:
				userCount > 0 ? Math.round((watchlistCount / userCount) * 10) / 10 : 0,
		};
	}

	/**
	 * Get basic activity statistics
	 */
	async getActivityStats(): Promise<ActivityStatistics> {
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);

		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const [last24HoursActivity, lastWeekActivity] = await Promise.all([
			ActivityLog.count({
				where: {
					created_at: { [Op.gte]: oneDayAgo },
				},
			}),
			ActivityLog.count({
				where: {
					created_at: { [Op.gte]: oneWeekAgo },
				},
			}),
		]);

		return {
			last24Hours: last24HoursActivity,
			lastWeek: lastWeekActivity,
		};
	}

	/**
	 * Get detailed activity statistics for a specific time period
	 */
	async getDetailedActivityStats(
		days: number = 7
	): Promise<ActivityStatistics> {
		// Ensure days parameter is reasonable
		if (days < 1 || days > 90) {
			days = 7; // Default to 7 days if invalid
		}

		// Basic activity stats
		const basicStats = await this.getActivityStats();

		// Get date for filtering
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		// Common where clause for filtering by date
		const dateFilter = {
			created_at: { [Op.gte]: startDate },
		};

		// Get activity counts by date
		const activityByDate = await ActivityLog.findAll({
			attributes: [
				[sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
				[sequelize.fn('COUNT', sequelize.col('*')), 'count'],
			],
			where: dateFilter,
			group: [sequelize.fn('DATE', sequelize.col('created_at'))],
			order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
		});

		// Get activity counts by type
		const activityByType = await ActivityLog.findAll({
			attributes: [
				'action',
				[sequelize.fn('COUNT', sequelize.col('*')), 'count'],
			],
			where: dateFilter,
			group: ['action'],
			order: [[sequelize.fn('COUNT', sequelize.col('*')), 'DESC']],
		});

		// Get most active users - use direct SQL with a subquery to validate UUIDs
		// This approach avoids the type issues with Sequelize operators
		const [mostActiveUsers] = await sequelize.query(`
      SELECT "ActivityLog"."user_id", COUNT(*) as count, 
             "User"."username", "User"."email"
      FROM "activity_log" AS "ActivityLog"
      INNER JOIN "users" AS "User" ON "ActivityLog"."user_id" = "User"."user_id"
      WHERE "ActivityLog"."created_at" >= '${startDate.toISOString()}'
      GROUP BY "ActivityLog"."user_id", "User"."username", "User"."email"
      ORDER BY count DESC
      LIMIT 10
    `);

		return {
			...basicStats,
			activityByDate,
			activityByType,
			mostActiveUsers,
		};
	}

	/**
	 * Get system health statistics
	 */
	async getSystemHealthStats(): Promise<SystemHealthStatistics> {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const recentErrors = await AuditLog.count({
			where: {
				level: 'error',
				created_at: { [Op.gte]: oneWeekAgo },
			},
		});

		return {
			recentErrors,
			uptime: process.uptime(), // Server uptime in seconds
			memoryUsage: process.memoryUsage(),
		};
	}

	/**
	 * Get detailed system statistics including OS, memory, and CPU info
	 */
	async getDetailedSystemStats(): Promise<SystemHealthStatistics> {
		const basicStats = await this.getSystemHealthStats();

		// Gather database size
		const dbSize = await sequelize
			.query('SELECT pg_database_size(current_database()) as size', {
				type: QueryTypes.SELECT,
			})
			.then(result => {
				if (
					result &&
					result.length > 0 &&
					typeof result[0] === 'object' &&
					result[0] !== null &&
					'size' in result[0]
				) {
					return Number(result[0].size);
				}
				return 0;
			})
			.catch(() => 0); // Handle databases that don't support this query

		// Calculate database statistics
		const dbSizeInMB = dbSize
			? Math.round((dbSize / (1024 * 1024)) * 100) / 100
			: 0;

		// Gather system metrics
		const systemMetrics = {
			...basicStats,
			os: {
				type: os.type(),
				platform: os.platform(),
				arch: os.arch(),
				release: os.release(),
				uptime: os.uptime(), // System uptime in seconds
				loadAvg: os.loadavg(),
			},
			memory: {
				total: os.totalmem(),
				free: os.freemem(),
				usagePercent: 100 * (1 - os.freemem() / os.totalmem()),
			},
			cpu: {
				cores: os.cpus().length,
				model: os.cpus()[0]?.model || 'Unknown',
				speed: os.cpus()[0]?.speed || 0,
			},
			process: {
				uptime: process.uptime(), // Node.js process uptime in seconds
				memoryUsage: process.memoryUsage(),
				nodeVersion: process.version,
				pid: process.pid,
			},
			database: {
				size: {
					bytes: dbSize,
					megabytes: dbSizeInMB,
				},
			},
		};

		return systemMetrics;
	}

	/**
	 * Get unified statistics for dashboard
	 */
	async getDashboardStats(): Promise<any> {
		const [userStats, contentStats] = await Promise.all([
			this.getUserStats(),
			this.getContentStats(),
		]);

		return {
			totalUsers: userStats.totalUsers,
			activeUsers: userStats.activeUsers,
			totalMatches: contentStats.matches,
			watchlistEntries: contentStats.watchlistEntries,
		};
	}

	/**
	 * Get system metrics (simplified statistics)
	 */
	async getSystemMetrics(): Promise<any> {
		const [userStats, contentStats, activityStats, systemStats] =
			await Promise.all([
				this.getUserStats(),
				this.getContentStats(),
				this.getActivityStats(),
				this.getSystemHealthStats(),
			]);

		return {
			users: userStats,
			content: contentStats,
			activity: activityStats,
			system: {
				...systemStats,
				timestamp: new Date(),
			},
		};
	}

	/**
	 * Get comprehensive system statistics
	 */
	async getSystemStats(): Promise<any> {
		const [userStats, contentStats, systemStats] = await Promise.all([
			this.getDetailedUserStats(),
			this.getContentStats(),
			this.getDetailedSystemStats(),
		]);

		return {
			timestamp: new Date(),
			database: {
				totalUsers: userStats.totalUsers,
				newUsers: userStats.newUsers,
				activeUsers: userStats.activeUsers,
				inactivePercentage: userStats.inactivePercentage,
				contentStats: {
					watchlistEntries: contentStats.watchlistEntries,
					matches: contentStats.matches,
					averageWatchlistPerUser: contentStats.averageWatchlistPerUser,
				},
				errorCount: systemStats.recentErrors,
				size: systemStats.database?.size,
			},
			system: {
				os: systemStats.os,
				memory: systemStats.memory,
				cpu: systemStats.cpu,
				process: systemStats.process,
			},
		};
	}

	/**
	 * Get unified statistics with customizable options
	 */
	async getUnifiedStats(
		options: StatsOptions = {}
	): Promise<UnifiedStatistics> {
		const { includeDetailed = false, activityDays = 7 } = options;

		// Choose appropriate stats methods based on detail level
		const userStatsPromise = includeDetailed
			? this.getDetailedUserStats()
			: this.getUserStats();

		const systemStatsPromise = includeDetailed
			? this.getDetailedSystemStats()
			: this.getSystemHealthStats();

		const activityStatsPromise = includeDetailed
			? this.getDetailedActivityStats(activityDays)
			: this.getActivityStats();

		// Run all queries in parallel
		const [userStats, contentStats, activityStats, systemStats] =
			await Promise.all([
				userStatsPromise,
				this.getContentStats(),
				activityStatsPromise,
				systemStatsPromise,
			]);

		// Return unified stats
		return {
			timestamp: new Date(),
			users: userStats,
			content: contentStats,
			activity: activityStats,
			system: systemStats,
		};
	}
}

// Create and export singleton instance
export const statisticsService = new StatisticsService();
