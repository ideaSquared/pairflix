import { ActivityLog } from '../models/ActivityLog';
import { activityService, ActivityType } from './activity.service';

// Mock ActivityLog model
jest.mock('../models/ActivityLog', () => {
	return {
		ActivityLog: {
			create: jest.fn(),
			findAll: jest.fn(),
		},
	};
});

describe('ActivityService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('logActivity', () => {
		it('should create a new activity log entry', async () => {
			const mockActivity = {
				log_id: '123',
				user_id: 'user123',
				action: ActivityType.WATCHLIST_ADD,
				metadata: { tmdbId: 550, mediaType: 'movie' },
				created_at: new Date(),
			};

			(ActivityLog.create as jest.Mock).mockResolvedValue(mockActivity);

			const result = await activityService.logActivity(
				'user123',
				ActivityType.WATCHLIST_ADD,
				{ tmdbId: 550, mediaType: 'movie' }
			);

			expect(ActivityLog.create).toHaveBeenCalledWith({
				user_id: 'user123',
				action: ActivityType.WATCHLIST_ADD,
				metadata: { tmdbId: 550, mediaType: 'movie' },
			});
			expect(result).toEqual(mockActivity);
		});

		it('should handle errors without throwing', async () => {
			(ActivityLog.create as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			console.error = jest.fn(); // Mock console.error

			const result = await activityService.logActivity(
				'user123',
				ActivityType.WATCHLIST_ADD
			);

			expect(ActivityLog.create).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});

	describe('getUserActivities', () => {
		it('should fetch activities for a specific user', async () => {
			const mockActivities = [
				{
					log_id: '123',
					user_id: 'user123',
					action: ActivityType.WATCHLIST_ADD,
					metadata: { tmdbId: 550 },
					created_at: new Date(),
				},
				{
					log_id: '124',
					user_id: 'user123',
					action: ActivityType.WATCHLIST_RATE,
					metadata: { tmdbId: 550, rating: 9 },
					created_at: new Date(),
				},
			];

			(ActivityLog.findAll as jest.Mock).mockResolvedValue(mockActivities);

			const result = await activityService.getUserActivities('user123', 10, 0);

			expect(ActivityLog.findAll).toHaveBeenCalledWith({
				where: { user_id: 'user123' },
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
			});
			expect(result).toEqual(mockActivities);
		});
	});

	describe('getRecentActivities', () => {
		it('should fetch all recent activities excluding a specific user', async () => {
			const mockActivities = [
				{
					log_id: '123',
					user_id: 'user456',
					action: ActivityType.WATCHLIST_ADD,
					metadata: { tmdbId: 550 },
					created_at: new Date(),
					user: {
						user_id: 'user456',
						username: 'partner',
					},
				},
			];

			(ActivityLog.findAll as jest.Mock).mockResolvedValue(mockActivities);

			const result = await activityService.getRecentActivities(
				'user123',
				10,
				0
			);

			expect(ActivityLog.findAll).toHaveBeenCalledWith({
				where: {
					user_id: {
						[Symbol.for('ne')]: 'user123',
					},
				},
				order: [['created_at', 'DESC']],
				limit: 10,
				offset: 0,
				include: [
					{
						association: 'user',
						attributes: ['user_id', 'username'],
					},
				],
			});
			expect(result).toEqual(mockActivities);
		});
	});
});
