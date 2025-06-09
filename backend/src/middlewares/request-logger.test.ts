// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\middlewares\request-logger.test.ts
import type { Request, Response } from 'express';
import { auditLogService } from '../services/audit.service';
import { requestLogger } from './request-logger';

// Mock dependencies
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		info: jest.fn(),
	},
}));

describe('Request Logger Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;

	beforeEach(() => {
		mockRequest = {
			method: 'GET',
			path: '/api/users',
			query: { filter: 'active' },
			body: { test: 'data' },
			ip: '127.0.0.1',
			get: jest.fn().mockReturnValue('test-user-agent'),
		};
		mockResponse = {};
		nextFunction = jest.fn();

		// Reset all mocks
		jest.clearAllMocks();
	});

	it('should log the request and call next()', async () => {
		// Arrange
		mockRequest.user = {
			user_id: 'test-user-id',
			email: 'test@example.com',
			username: 'testuser',
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
		await requestLogger(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.info).toHaveBeenCalledWith(
			'API Request: GET /api/users',
			'api-request',
			expect.objectContaining({
				method: mockRequest.method,
				path: mockRequest.path,
				userId: 'test-user-id',
				ip: '127.0.0.1',
			})
		);
		expect(nextFunction).toHaveBeenCalled();
	});

	it('should skip logging for health check endpoint and call next()', async () => {
		// Create a new request object with the health path
		const healthRequest: Partial<Request> = {
			...mockRequest,
			path: '/health',
		};

		// Act
		await requestLogger(
			healthRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.info).not.toHaveBeenCalled();
		expect(nextFunction).toHaveBeenCalled();
	});

	it('should skip logging for favicon and call next()', async () => {
		// Create a new request object with the favicon path
		const faviconRequest: Partial<Request> = {
			...mockRequest,
			path: '/favicon.ico',
		};

		// Act
		await requestLogger(
			faviconRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.info).not.toHaveBeenCalled();
		expect(nextFunction).toHaveBeenCalled();
	});

	it('should log request without user information when not authenticated', async () => {
		// Arrange - create a new request object without the user property
		const unauthenticatedRequest: Partial<Request> = { ...mockRequest };
		// Don't set the user property at all

		// Act
		await requestLogger(
			unauthenticatedRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.info).toHaveBeenCalledWith(
			'API Request: GET /api/users',
			'api-request',
			expect.objectContaining({
				method: mockRequest.method,
				path: mockRequest.path,
				userId: null,
				ip: '127.0.0.1',
			})
		);
		expect(nextFunction).toHaveBeenCalled();
	});
});
