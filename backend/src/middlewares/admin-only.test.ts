// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\middlewares\admin-only.test.ts
import type { Response } from 'express';
import { auditLogService } from '../services/audit.service';
import type { AuthenticatedRequest } from '../types';
import { adminOnlyMiddleware } from './admin-only';

// Mock dependencies
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		warn: jest.fn(),
	},
}));

describe('Admin Only Middleware', () => {
	let mockRequest: Partial<AuthenticatedRequest>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		mockRequest = {
			path: '/admin/dashboard',
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

	it('should return 401 if no user is in the request', async () => {
		// Arrange
		// Use delete to remove the user property entirely instead of setting it to undefined
		delete mockRequest.user;

		// Act
		await adminOnlyMiddleware(
			mockRequest as AuthenticatedRequest,
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
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		};

		// Act
		await adminOnlyMiddleware(
			mockRequest as AuthenticatedRequest,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(mockResponse.status).toHaveBeenCalledWith(403);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: 'Admin access required',
		});
		expect(nextFunction).not.toHaveBeenCalled();
		expect(auditLogService.warn).toHaveBeenCalledWith(
			'Unauthorized admin access attempt',
			'admin-middleware',
			expect.objectContaining({
				userId: mockRequest.user.user_id,
				email: mockRequest.user.email,
			})
		);
	});

	it('should call next() if user is an admin', async () => {
		// Arrange
		mockRequest.user = {
			user_id: 'admin-user-id',
			email: 'admin@example.com',
			username: 'adminuser',
			role: 'admin',
			status: 'active',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		};

		// Act
		await adminOnlyMiddleware(
			mockRequest as AuthenticatedRequest,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(nextFunction).toHaveBeenCalled();
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).not.toHaveBeenCalled();
		expect(auditLogService.warn).not.toHaveBeenCalled();
	});
});
