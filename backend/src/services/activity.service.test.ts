import { ActivityLog } from '../models/ActivityLog';
import Match from '../models/Match';
import { activityService, ActivityType } from './activity.service';

// Mock ActivityLog model
jest.mock('../models/ActivityLog', () => ({
	ActivityLog: {
		create: jest.fn(),
		findAll: jest.fn(),
	},
}));

// Mock Match model
jest.mock('../models/Match', () => ({
	Match: {
		findAll: jest.fn(),
	},
}));

// Create properly typed mock instances to avoid unbound method errors
const mockActivityLogCreate = jest.fn();
const mockActivityLogFindAll = jest.fn();
const mockMatchFindAll = jest.fn();

// Assign the mocks to the model methods
(ActivityLog.create as jest.Mock) = mockActivityLogCreate;
(ActivityLog.findAll as jest.Mock) = mockActivityLogFindAll;
(Match.findAll as jest.Mock) = mockMatchFindAll;

describe('ActivityService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockActivityLogCreate.mockClear();
		mockActivityLogFindAll.mockClear();
		mockMatchFindAll.mockClear();
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

	describe('getPartnerActivities', () => {
		it('should fetch activities from matched partners', async () => {
			const mockMatches = [
				{
					user1_id: 'user123',
					user2_id: 'partner456',
					status: 'accepted',
				},
				{
					user1_id: 'partner789',
					user2_id: 'user123',
					status: 'accepted',
				},
			];

			const mockActivities = [
				{
					log_id: '123',
					user_id: 'partner456',
					action: ActivityType.WATCHLIST_ADD,
					metadata: { tmdbId: 550 },
					created_at: new Date(),
					user: {
						user_id: 'partner456',
						username: 'partner',
					},
				},
			];

			mockMatchFindAll.mockResolvedValue(mockMatches);
			mockActivityLogFindAll.mockResolvedValue(mockActivities);

			const result = await activityService.getPartnerActivities(
				'user123',
				10,
				0
			);

			expect(mockMatchFindAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						or: expect.arrayContaining([
							{ user1_id: 'user123', status: 'accepted' },
							{ user2_id: 'user123', status: 'accepted' },
						]),
					}),
				})
			);

			expect(result).toEqual(mockActivities);
		});
	});

	describe('getUserSocialActivities', () => {
		it('should fetch social activities for a specific user', async () => {
			const mockActivities = [
				{
					log_id: '123',
					user_id: 'user123',
					action: ActivityType.WATCHLIST_ADD,
					metadata: { tmdbId: 550 },
					created_at: new Date(),
					user: {
						user_id: 'user123',
						username: 'testuser',
					},
				},
			];

			mockActivityLogFindAll.mockResolvedValue(mockActivities);

			const result = await activityService.getUserSocialActivities(
				'user123',
				10,
				0
			);

			expect(result).toEqual(mockActivities);
		});
	});
});
