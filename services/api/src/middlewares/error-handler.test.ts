// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\middlewares\error-handler.test.ts
import type { Request, Response } from 'express';
import { auditLogService } from '../services/audit.service';
import { errorHandler } from './error-handler';

// Mock dependencies
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		error: jest.fn(),
	},
}));

describe('Error Handler Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.Mock;
	let originalEnv: string | undefined;

	beforeEach(() => {
		mockRequest = {
			path: '/api/users',
			method: 'GET',
			query: { filter: 'active' },
			body: { test: 'data' },
			user: {
				user_id: 'test-user-id',
				email: 'test@example.com',
				username: 'testuser',
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
			},
		};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		nextFunction = jest.fn();

		// Store original NODE_ENV
		originalEnv = process.env.NODE_ENV;

		// Reset all mocks
		jest.clearAllMocks();
	});

	afterEach(() => {
		// Restore original NODE_ENV
		process.env.NODE_ENV = originalEnv;
	});

	it('should log error and return 500 with error details in development mode', async () => {
		// Arrange
		process.env.NODE_ENV = 'development';
		const testError = new Error('Test error message');
		testError.stack = 'Test error stack';

		// Act
		await errorHandler(
			testError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.error).toHaveBeenCalledWith(
			'Test error message',
			'server-error',
			expect.objectContaining({
				path: '/api/users',
				method: 'GET',
				userId: 'test-user-id',
				stack: 'Test error stack',
			})
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: 'Test error message',
			stack: 'Test error stack',
		});
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('should log error and return 500 without stack trace in production mode', async () => {
		// Arrange
		process.env.NODE_ENV = 'production';
		const testError = new Error('Test error message');
		testError.stack = 'Test error stack';

		// Act
		await errorHandler(
			testError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.error).toHaveBeenCalledWith(
			'Test error message',
			'server-error',
			expect.objectContaining({
				path: '/api/users',
				method: 'GET',
				userId: 'test-user-id',
				stack: 'Test error stack',
			})
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: 'Test error message',
		});
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it('should handle error without message', async () => {
		// Arrange
		const testError = new Error();
		testError.stack = 'Test error stack';

		// Act
		await errorHandler(
			testError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.error).toHaveBeenCalledWith(
			'Unknown server error',
			'server-error',
			expect.any(Object)
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: 'Internal Server Error',
			})
		);
	});

	it('should handle requests without user information', async () => {
		// Arrange
		// Use delete to remove the user property entirely instead of setting it to undefined
		delete mockRequest.user;
		const testError = new Error('Test error message');

		// Act
		await errorHandler(
			testError,
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		// Assert
		expect(auditLogService.error).toHaveBeenCalledWith(
			'Test error message',
			'server-error',
			expect.objectContaining({
				path: '/api/users',
				method: 'GET',
				userId: null,
			})
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
	});
});
