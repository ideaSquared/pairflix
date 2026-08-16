// filepath: g:\ideasquared\projects\pairflix\backend\src\controllers\activity.controller.test.ts
import type { Request, Response } from 'express';
import { activityService } from '../services/activity.service';
import { mockRequest, mockResponse } from '../tests/controller-helpers';
import type { AuthenticatedRequest } from '../types';
import { activityController } from './activity.controller';

// Mock activity service
jest.mock('../services/activity.service', () => ({
	activityService: {
		getUserActivities: jest.fn(),
		getRecentActivities: jest.fn(),
		getPartnerActivities: jest.fn(),
		getUserSocialActivities: jest.fn(),
	},
}));

describe('ActivityController', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		req = mockRequest();
		res = mockResponse();
		jest.clearAllMocks();
	});

	describe('getUserActivities', () => {
		it('should return user activities', async () => {
			const mockActivities = [
				{
					log_id: '1',
					user_id: 'user123',
					action: 'WATCHLIST_ADD',
					created_at: new Date(),
				},
				{
					log_id: '2',
					user_id: 'user123',
					action: 'WATCHLIST_RATE',
					created_at: new Date(),
				},
			];

			(activityService.getUserActivities as jest.Mock).mockResolvedValue(
				mockActivities
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};
			req.query = { limit: '10', offset: '0' };

			await activityController.getUserActivities(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(activityService.getUserActivities).toHaveBeenCalledWith(
				'user123',
				10,
				0
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ activities: mockActivities });
		});

		it('should handle errors', async () => {
			(activityService.getUserActivities as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			await activityController.getUserActivities(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to fetch activities',
			});
		});
	});

	describe('getPartnerActivities', () => {
		it('should return partner activities', async () => {
			const mockActivities = [
				{
					log_id: '1',
					user_id: 'partner456',
					action: 'WATCHLIST_ADD',
					created_at: new Date(),
				},
			];

			(activityService.getPartnerActivities as jest.Mock).mockResolvedValue(
				mockActivities
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};
			req.query = { limit: '10', offset: '0' };

			await activityController.getPartnerActivities(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(activityService.getPartnerActivities).toHaveBeenCalledWith(
				'user123',
				10,
				0
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ activities: mockActivities });
		});

		it('should handle errors', async () => {
			(activityService.getPartnerActivities as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			await activityController.getPartnerActivities(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to fetch activities',
			});
		});
	});

	describe('getFeed', () => {
		it('should return combined activities sorted by date', async () => {
			const date1 = new Date('2023-01-01');
			const date2 = new Date('2023-01-02');
			const date3 = new Date('2023-01-03');

			const userActivities = [
				{
					log_id: '1',
					user_id: 'user123',
					action: 'WATCHLIST_ADD',
					created_at: date1,
				},
				{
					log_id: '3',
					user_id: 'user123',
					action: 'WATCHLIST_RATE',
					created_at: date3,
				},
			];

			const partnerActivities = [
				{
					log_id: '2',
					user_id: 'partner456',
					action: 'WATCHLIST_ADD',
					created_at: date2,
				},
			];

			(activityService.getUserSocialActivities as jest.Mock).mockResolvedValue(
				userActivities
			);
			(activityService.getPartnerActivities as jest.Mock).mockResolvedValue(
				partnerActivities
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};
			req.query = { limit: '10', offset: '0' };

			await activityController.getFeed(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(activityService.getUserSocialActivities).toHaveBeenCalledWith(
				'user123',
				10,
				0
			);
			expect(activityService.getPartnerActivities).toHaveBeenCalledWith(
				'user123',
				10,
				0
			);
			expect(res.status).toHaveBeenCalledWith(200);

			const expectedCombinedActivities = [
				{
					log_id: '3',
					user_id: 'user123',
					action: 'WATCHLIST_RATE',
					created_at: date3,
				},
				{
					log_id: '2',
					user_id: 'partner456',
					action: 'WATCHLIST_ADD',
					created_at: date2,
				},
				{
					log_id: '1',
					user_id: 'user123',
					action: 'WATCHLIST_ADD',
					created_at: date1,
				},
			];
			expect(res.json).toHaveBeenCalledWith({
				activities: expectedCombinedActivities,
			});
		});

		it('should handle errors', async () => {
			(activityService.getUserSocialActivities as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			req.user = {
				user_id: 'user123',
				email: 'user@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'light',
					viewStyle: 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			await activityController.getFeed(
				req as unknown as AuthenticatedRequest,
				res as Response
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Failed to fetch activity feed',
			});
		});
	});
});
