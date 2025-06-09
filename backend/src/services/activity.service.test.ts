import { ActivityLog } from '../models/ActivityLog';
import { activityService, ActivityType } from './activity.service';

// Mock ActivityLog model
jest.mock('../models/ActivityLog', () => ({
	ActivityLog: {
		create: jest.fn(),
		findAll: jest.fn(),
	},
}));

// Create properly typed mock instances to avoid unbound method errors
const mockActivityLogCreate = jest.fn();
const mockActivityLogFindAll = jest.fn();

// Assign the mocks to the ActivityLog methods
(ActivityLog.create as jest.Mock) = mockActivityLogCreate;
(ActivityLog.findAll as jest.Mock) = mockActivityLogFindAll;

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
				context: 'watchlist',
				metadata: { tmdbId: 550, mediaType: 'movie' },
				ip_address: null,
				user_agent: null,
				created_at: new Date(),
			};

			mockActivityLogCreate.mockResolvedValue(mockActivity);

			const result = await activityService.logActivity(
				'user123',
				ActivityType.WATCHLIST_ADD,
				{ tmdbId: 550, mediaType: 'movie' }
			);

			expect(mockActivityLogCreate).toHaveBeenCalledWith({
				user_id: 'user123',
				action: ActivityType.WATCHLIST_ADD,
				context: 'watchlist',
				metadata: { tmdbId: 550, mediaType: 'movie' },
				ip_address: null,
				user_agent: null,
			});
			expect(result).toEqual(mockActivity);
		});

		it('should handle errors without throwing', async () => {
			mockActivityLogCreate.mockRejectedValue(new Error('Database error'));

			console.error = jest.fn(); // Mock console.error

			const result = await activityService.logActivity(
				'user123',
				ActivityType.WATCHLIST_ADD
			);

			expect(mockActivityLogCreate).toHaveBeenCalled();
			expect(console.error).toHaveBeenCalled();
			expect(result).toBeUndefined();
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

			mockActivityLogFindAll.mockResolvedValue(mockActivities);

			const result = await activityService.getUserActivities('user123', 10, 0);

			expect(mockActivityLogFindAll).toHaveBeenCalledWith({
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

			mockActivityLogFindAll.mockResolvedValue(mockActivities);

			const result = await activityService.getRecentActivities(
				'user123',
				10,
				0
			);

			expect(mockActivityLogFindAll).toHaveBeenCalledWith({
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
