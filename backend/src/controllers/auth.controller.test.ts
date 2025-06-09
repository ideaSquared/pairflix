import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import type { AuthenticatedRequest } from '../types';
import { getCurrentUser, login } from './auth.controller';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
	authenticateUser: jest.fn(),
}));

// Mock the audit service
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		info: jest.fn().mockResolvedValue({}),
		warn: jest.fn().mockResolvedValue({}),
	},
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
	verify: jest.fn(),
}));

// Mock process.env
process.env.JWT_SECRET = 'test-secret';

// Type the mocked functions
const mockedAuthenticateUser = authenticateUser as jest.MockedFunction<
	typeof authenticateUser
>;
const mockedJwtVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;
const mockedAuditLogInfo = auditLogService.info as jest.MockedFunction<
	typeof auditLogService.info
>;
const mockedAuditLogWarn = auditLogService.warn as jest.MockedFunction<
	typeof auditLogService.warn
>;

describe('Auth Controller', () => {
	beforeEach(() => {
		resetMocks();
		jest.clearAllMocks();

		// Reset jwt.verify mock to a default implementation
		(mockedJwtVerify as jest.Mock).mockReturnValue({
			user_id: 'test-user-id',
			email: 'test@example.com',
			username: 'testuser',
			preferences: {},
		});
	});

	describe('login', () => {
		it('should return a token when credentials are valid', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'test@example.com', password: 'password123' },
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();
			const mockToken = 'valid-jwt-token'; // Mock the authenticateUser service to return a token
			mockedAuthenticateUser.mockResolvedValue(mockToken);

			// Ensure jwt.verify returns the expected decoded token
			(mockedJwtVerify as jest.Mock).mockReturnValue({
				user_id: 'test-user-id',
				email: 'test@example.com',
				username: 'testuser',
				preferences: {},
			});

			// Act
			await login(req, res);

			// Assert
			expect(mockedAuthenticateUser).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
			expect(mockedJwtVerify).toHaveBeenCalledWith(mockToken, 'test-secret');
			expect(res.json).toHaveBeenCalledWith({ token: mockToken });
			expect(res.status).not.toHaveBeenCalled(); // Should not call status for success cases
			expect(mockedAuditLogInfo).toHaveBeenCalledTimes(2); // Two audit log calls
		});

		it('should return 401 when credentials are invalid', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'wrong@example.com', password: 'wrongpassword' },
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse(); // Mock the authenticateUser service to throw an error
			const errorMessage = 'Invalid credentials';
			mockedAuthenticateUser.mockRejectedValue(new Error(errorMessage));

			// Act
			await login(req, res);

			// Assert
			expect(mockedAuthenticateUser).toHaveBeenCalledWith(
				'wrong@example.com',
				'wrongpassword'
			);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
			expect(mockedAuditLogInfo).toHaveBeenCalledTimes(1); // Only one info call for attempt
			expect(mockedAuditLogWarn).toHaveBeenCalledTimes(1); // One warn call for failed login
		});

		it('should return 500 when an unknown error occurs', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'test@example.com', password: 'password123' },
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse(); // Mock the authenticateUser service to throw a non-Error object
			mockedAuthenticateUser.mockRejectedValue('string error'); // Not an Error instance

			// Act
			await login(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
			expect(mockedAuditLogInfo).toHaveBeenCalledTimes(1); // Only one info call for attempt
			expect(mockedAuditLogWarn).toHaveBeenCalledTimes(1); // One warn call for failed login
		});
	});

	describe('getCurrentUser', () => {
		it('should return the current user from request', async () => {
			// Arrange
			// Using proper literal types for preferences
			const mockUser = {
				user_id: 'test-user-id',
				email: 'test@example.com',
				username: 'testuser',
				role: 'user', // Add the missing role property
				preferences: {
					theme: 'dark' as 'dark' | 'light',
					viewStyle: 'grid' as 'grid' | 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [] as string[],
				},
				status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
			};

			const req = mockRequest({ user: mockUser });
			const res = mockResponse();

			// Act
			await getCurrentUser(req as unknown as AuthenticatedRequest, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith(mockUser);
		});

		it('should handle errors and return 500', async () => {
			// Arrange
			// Create a mock request without the user property to trigger an error
			const req = {
				body: {},
				params: {},
				query: {},
				// Explicitly omit the user property
			} as Request;
			const res = mockResponse();

			// Act
			await getCurrentUser(req as unknown as AuthenticatedRequest, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});
});
