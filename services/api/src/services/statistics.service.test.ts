// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\services\statistics.service.test.ts

// Create mock functions first
const mockQuery = jest.fn().mockResolvedValue([[], []]);
const mockFn = jest.fn();
const mockCol = jest.fn();

// Create mock functions for models
const mockUserCount = jest.fn().mockResolvedValue(0);
const mockActivityLogCount = jest.fn().mockResolvedValue(0);
const mockActivityLogFindAll = jest.fn().mockResolvedValue([]);
const mockAuditLogCount = jest.fn().mockResolvedValue(0);
const mockAuditLogFindAll = jest.fn().mockResolvedValue([]);
const mockMatchCount = jest.fn().mockResolvedValue(0);
const mockWatchlistEntryCount = jest.fn().mockResolvedValue(0);

// Mock all dependencies with proper type safety
jest.mock('sequelize', () => ({
	Op: {
		gte: 'gte',
	},
	QueryTypes: {
		SELECT: 'SELECT',
	},
}));

// Mock database connection
jest.mock('../db/connection', () => ({
	query: mockQuery,
	fn: mockFn,
	col: mockCol,
	default: {
		query: mockQuery,
		fn: mockFn,
		col: mockCol,
	},
}));

// Mock models with type-safe implementations
jest.mock('../models/User', () => ({
	__esModule: true,
	default: {
		count: mockUserCount,
	},
}));

jest.mock('../models/ActivityLog', () => ({
	__esModule: true,
	default: {
		count: mockActivityLogCount,
		findAll: mockActivityLogFindAll,
	},
}));

jest.mock('../models/AuditLog', () => ({
	__esModule: true,
	default: {
		count: mockAuditLogCount,
		findAll: mockAuditLogFindAll,
	},
}));

jest.mock('../models/Match', () => ({
	__esModule: true,
	default: {
		count: mockMatchCount,
	},
}));

jest.mock('../models/WatchlistEntry', () => ({
	__esModule: true,
	default: {
		count: mockWatchlistEntryCount,
	},
}));

// Mock OS module
jest.mock('os', () => ({
	cpus: jest.fn().mockReturnValue([
		{ model: 'CPU Model', speed: 2800 },
		{ model: 'CPU Model', speed: 2800 },
	]),
	totalmem: jest.fn().mockReturnValue(16 * 1024 * 1024 * 1024),
	freemem: jest.fn().mockReturnValue(8 * 1024 * 1024 * 1024),
	platform: jest.fn().mockReturnValue('darwin'),
	type: jest.fn().mockReturnValue('Mac OS'),
	release: jest.fn().mockReturnValue('11.0.0'),
	hostname: jest.fn().mockReturnValue('test-host'),
	arch: jest.fn().mockReturnValue('x64'),
	uptime: jest.fn().mockReturnValue(3600),
	loadavg: jest.fn().mockReturnValue([1.0, 1.2, 0.8]),
}));

import { statisticsService } from './statistics.service';

describe('StatisticsService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getUserStats', () => {
		it('should return user registration statistics', async () => {
			mockUserCount
				.mockResolvedValueOnce(10) // total users
				.mockResolvedValueOnce(2); // active users

			const result = await statisticsService.getUserStats();

			expect(result).toEqual({
				totalUsers: 10,
				activeUsers: 2,
				inactivePercentage: 80,
			});
			expect(mockUserCount).toHaveBeenCalledTimes(2);
		});

		it('should handle zero users', async () => {
			mockUserCount
				.mockResolvedValueOnce(0) // total users
				.mockResolvedValueOnce(0); // active users

			const result = await statisticsService.getUserStats();

			expect(result).toEqual({
				totalUsers: 0,
				activeUsers: 0,
				inactivePercentage: 0,
			});
		});
	});

	describe('getContentStats', () => {
		it('should return content statistics', async () => {
			mockWatchlistEntryCount.mockResolvedValueOnce(200);
			mockMatchCount.mockResolvedValueOnce(50);
			mockUserCount.mockResolvedValueOnce(10);

			const result = await statisticsService.getContentStats();

			expect(result).toEqual({
				watchlistEntries: 200,
				matches: 50,
				averageWatchlistPerUser: 20,
			});
		});

		it('should handle zero users for average calculation', async () => {
			mockWatchlistEntryCount.mockResolvedValueOnce(100);
			mockMatchCount.mockResolvedValueOnce(25);
			mockUserCount.mockResolvedValueOnce(0);

			const result = await statisticsService.getContentStats();

			expect(result).toEqual({
				watchlistEntries: 100,
				matches: 25,
				averageWatchlistPerUser: undefined,
			});
		});
	});

	describe('getActivityStats', () => {
		it('should return activity statistics', async () => {
			mockActivityLogCount
				.mockResolvedValueOnce(20) // last 24 hours
				.mockResolvedValueOnce(50); // last week

			const result = await statisticsService.getActivityStats();

			expect(result).toEqual({
				last24Hours: 20,
				lastWeek: 50,
			});
			expect(mockActivityLogCount).toHaveBeenCalledTimes(2);
		});
	});

	describe('getSystemHealthStats', () => {
		it('should return system health statistics', async () => {
			mockAuditLogCount.mockResolvedValueOnce(5);

			const result = await statisticsService.getSystemHealthStats();

			expect(result).toEqual({
				recentErrors: 5,
				uptime: expect.any(Number) as number,
				memoryUsage: expect.any(Object) as NodeJS.MemoryUsage,
			});
			expect(mockAuditLogCount).toHaveBeenCalledTimes(1);
		});
	});

	describe('getDetailedActivityStats', () => {
		it('should return detailed activity statistics', async () => {
			// Mock basic activity stats
			mockActivityLogCount
				.mockResolvedValueOnce(20) // last 24 hours
				.mockResolvedValueOnce(50); // last week

			// Mock activity by date
			mockActivityLogFindAll
				.mockResolvedValueOnce([
					{ date: '2025-06-07', count: 10 },
					{ date: '2025-06-08', count: 15 },
				])
				// Mock activity by type
				.mockResolvedValueOnce([
					{ action: 'login', count: 30 },
					{ action: 'search', count: 20 },
				]);

			// Mock most active users query
			mockQuery.mockResolvedValueOnce([
				[
					{
						user_id: '1',
						count: 50,
						username: 'user1',
						email: 'user1@example.com',
					},
				],
			]);

			const result = await statisticsService.getDetailedActivityStats(7);

			expect(result).toHaveProperty('last24Hours', 20);
			expect(result).toHaveProperty('lastWeek', 50);
			expect(result).toHaveProperty('activityByDate');
			expect(result).toHaveProperty('activityByType');
			expect(result).toHaveProperty('mostActiveUsers');

			expect(Array.isArray(result.activityByDate)).toBe(true);
			expect(Array.isArray(result.activityByType)).toBe(true);
			expect(Array.isArray(result.mostActiveUsers)).toBe(true);
		});

		it('should handle invalid days parameter', async () => {
			// Mock basic activity stats
			mockActivityLogCount.mockResolvedValueOnce(10).mockResolvedValueOnce(25);

			mockActivityLogFindAll
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([]);

			mockQuery.mockResolvedValueOnce([[]]);

			// Test with invalid days (should default to 7)
			const result = await statisticsService.getDetailedActivityStats(0);

			expect(result).toHaveProperty('last24Hours');
			expect(result).toHaveProperty('lastWeek');
		});
	});

	describe('getDashboardStats', () => {
		it('should return dashboard statistics', async () => {
			// Mock getUserStats directly instead of the underlying User.count calls
			jest.spyOn(statisticsService, 'getUserStats').mockResolvedValue({
				totalUsers: 100,
				activeUsers: 80,
				inactivePercentage: 20,
			});

			jest.spyOn(statisticsService, 'getContentStats').mockResolvedValue({
				watchlistEntries: 300,
				matches: 50,
				averageWatchlistPerUser: 3.0,
			});

			const result = await statisticsService.getDashboardStats();

			expect(result).toEqual({
				totalUsers: 100,
				activeUsers: 80,
				totalMatches: 50,
				watchlistEntries: 300,
			});
		});
	});

	describe('getSystemMetrics', () => {
		it('should return comprehensive system metrics', async () => {
			// Mock all the individual methods directly
			jest.spyOn(statisticsService, 'getUserStats').mockResolvedValue({
				totalUsers: 10,
				activeUsers: 8,
				inactivePercentage: 20,
			});

			jest.spyOn(statisticsService, 'getContentStats').mockResolvedValue({
				watchlistEntries: 150,
				matches: 25,
				averageWatchlistPerUser: 15,
			});

			jest.spyOn(statisticsService, 'getActivityStats').mockResolvedValue({
				last24Hours: 30,
				lastWeek: 100,
			});

			jest.spyOn(statisticsService, 'getSystemHealthStats').mockResolvedValue({
				recentErrors: 3,
				uptime: 12345,
				memoryUsage: {
					rss: 1024,
					heapTotal: 2048,
					heapUsed: 1536,
					external: 256,
					arrayBuffers: 128,
				},
			});

			const result = await statisticsService.getSystemMetrics();

			expect(result).toHaveProperty('users');
			expect(result).toHaveProperty('content');
			expect(result).toHaveProperty('activity');
			expect(result).toHaveProperty('system');

			expect(result.users).toEqual({
				totalUsers: 10,
				activeUsers: 8,
				inactivePercentage: 20,
			});

			expect(result.content).toEqual({
				watchlistEntries: 150,
				matches: 25,
				averageWatchlistPerUser: 15,
			});

			expect(result.activity).toEqual({
				last24Hours: 30,
				lastWeek: 100,
			});

			expect(result.system).toHaveProperty('recentErrors', 3);
			expect(result.system).toHaveProperty('uptime');
			expect(result.system).toHaveProperty('memoryUsage');
			expect(result.system).toHaveProperty('timestamp');
		});
	});
});
