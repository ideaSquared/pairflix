// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\middlewares\auth.test.ts
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auditLogService } from '../services/audit.service';
import { authenticateToken, requireAdmin } from './auth';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
	verify: jest.fn(),
	sign: jest.fn(),
}));

jest.mock('../models/User', () => ({
	__esModule: true,
	default: {
		findByPk: jest.fn(),
		findOne: jest.fn(),
	},
}));

jest.mock('../services/audit.service', () => ({
	auditLogService: {
		warn: jest.fn(),
	},
}));

import User from '../models/User';

describe('Auth Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		mockRequest = {
			headers: {},
			path: '/test/path',
			method: 'GET',
			ip: '127.0.0.1',
			get: jest.fn().mockReturnValue('test-user-agent'),
		};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		nextFunction = jest.fn();

		// Reset all mocks
		jest.clearAllMocks();
	});

	describe('authenticateToken', () => {
		it('should return 401 if no token is provided', async () => {
			// Arrange
			mockRequest.headers = {};

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Authentication required',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should return 403 if token is invalid', async () => {
			// Arrange
			mockRequest.headers = { authorization: 'Bearer invalid-token' };

			// Mock jwt.verify to throw an error
			(jwt.verify as jest.Mock).mockImplementation(() => {
				throw new Error('Invalid token');
			});

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Invalid or expired token',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should return 403 if user no longer exists', async () => {
			// Arrange
			mockRequest.headers = { authorization: 'Bearer valid-token' };

			const mockDecodedUser = {
				user_id: 'non-existent-user-id',
				email: 'test@example.com',
				username: 'testuser',
				role: 'user',
				status: 'active',
				preferences: {
					theme: 'dark' as const,
					viewStyle: 'grid' as const,
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockDecodedUser);
			(User.findByPk as jest.Mock).mockResolvedValue(null);

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(User.findByPk).toHaveBeenCalledWith(mockDecodedUser.user_id);
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Invalid or expired token',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should return 403 if user is suspended', async () => {
			// Arrange
			mockRequest.headers = { authorization: 'Bearer valid-token' };

			const mockDecodedUser = {
				user_id: 'suspended-user-id',
				email: 'suspended@example.com',
				username: 'suspendeduser',
				role: 'user',
				status: 'suspended',
				preferences: {
					theme: 'dark' as const,
					viewStyle: 'grid' as const,
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockDecodedUser);
			(User.findByPk as jest.Mock).mockResolvedValue({
				...mockDecodedUser,
				status: 'suspended',
			});

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error:
					'Your account has been suspended. Please contact support for assistance.',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should return 403 if user is banned', async () => {
			// Arrange
			mockRequest.headers = { authorization: 'Bearer valid-token' };

			const mockDecodedUser = {
				user_id: 'banned-user-id',
				email: 'banned@example.com',
				username: 'banneduser',
				role: 'user',
				status: 'banned',
				preferences: {
					theme: 'dark' as const,
					viewStyle: 'grid' as const,
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockDecodedUser);
			(User.findByPk as jest.Mock).mockResolvedValue({
				...mockDecodedUser,
				status: 'banned',
			});

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error:
					'Your account has been banned for violating our terms of service.',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should call next() for valid tokens and active users', async () => {
			// Arrange
			mockRequest.headers = { authorization: 'Bearer valid-token' };

			const mockDecodedUser = {
				user_id: 'valid-user-id',
				email: 'active@example.com',
				username: 'activeuser',
				role: 'user',
				status: 'active',
				email_verified: true,
				preferences: {
					theme: 'dark' as const,
					viewStyle: 'grid' as const,
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			(jwt.verify as jest.Mock).mockReturnValue(mockDecodedUser);
			(User.findByPk as jest.Mock).mockResolvedValue({
				...mockDecodedUser,
				status: 'active',
				save: jest.fn().mockResolvedValue(true),
			});

			// Act
			await authenticateToken(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockRequest.user).toEqual(mockDecodedUser);
			expect(nextFunction).toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.json).not.toHaveBeenCalled();
		});
	});

	describe('requireAdmin', () => {
		it('should return 401 if no user is in the request', async () => {
			// Arrange
			// Use delete to remove the user property entirely instead of setting it to undefined
			delete mockRequest.user;

			// Act
			await requireAdmin(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Authentication required',
			});
			expect(nextFunction).not.toHaveBeenCalled();
		});

		it('should return 403 if user is not an admin', async () => {
			// Arrange
			mockRequest.user = {
				user_id: 'regular-user-id',
				email: 'user@example.com',
				username: 'regularuser',
				role: 'user',
				status: 'active',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			// Act
			await requireAdmin(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Admin access required',
			});
			expect(nextFunction).not.toHaveBeenCalled();
			expect(auditLogService.warn).toHaveBeenCalled();
		});

		it('should call next() if user is an admin', async () => {
			// Arrange
			mockRequest.user = {
				user_id: 'admin-user-id',
				email: 'admin@example.com',
				username: 'adminuser',
				role: 'admin',
				status: 'active',
				email_verified: true,
				failed_login_attempts: 0,
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			};

			// Act
			await requireAdmin(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			);

			// Assert
			expect(nextFunction).toHaveBeenCalled();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.json).not.toHaveBeenCalled();
		});
	});
});
