import bcrypt from 'bcryptjs';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import type { AuthenticatedRequest } from '../types';
import { getCurrentUser, login, register } from './auth.controller';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
	authenticateUser: jest.fn(),
}));

// Mock the User model
jest.mock('../models/User', () => ({
	findOne: jest.fn(),
	create: jest.fn(),
}));

// Mock EmailVerification model
jest.mock('../models/EmailVerification', () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
	},
}));

// Mock ActivityLog model
jest.mock('../models/ActivityLog', () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
	},
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

// Mock audit service
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(),
	verify: jest.fn(),
}));

// Mock email service
jest.mock('../services/email.service', () => ({
	generateEmailVerificationEmail: jest
		.fn()
		.mockReturnValue('<html>Email content</html>'),
	sendEmail: jest.fn().mockResolvedValue(true),
}));

// Mock activity service
jest.mock('../services/activity.service', () => ({
	activityService: {
		logActivity: jest.fn().mockResolvedValue(undefined),
	},
	ActivityType: {
		USER_LOGIN: 'USER_LOGIN',
	},
}));

// Type the mocked functions
const mockedAuthenticateUser = authenticateUser as jest.MockedFunction<
	typeof authenticateUser
>;
const mockedUserFindOne = User.findOne as jest.MockedFunction<
	typeof User.findOne
>;
const mockedUserCreate = User.create as jest.MockedFunction<typeof User.create>;
const mockedBcryptHash = bcrypt.hash as jest.MockedFunction<any>;
const mockedJwtSign = jwt.sign as jest.MockedFunction<any>;
const mockedJwtVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;
const mockedAuditLogInfo = auditLogService.info as jest.MockedFunction<
	typeof auditLogService.info
>;
const mockedAuditLogWarn = auditLogService.warn as jest.MockedFunction<
	typeof auditLogService.warn
>;
const mockedAuditLogError = auditLogService.error as jest.MockedFunction<
	typeof auditLogService.error
>;

describe('Auth Controller', () => {
	beforeEach(() => {
		resetMocks();
		jest.clearAllMocks();
		// Set default JWT secret
		process.env.JWT_SECRET = 'test-secret';
	});

	describe('register', () => {
		const validRegisterData = {
			email: 'test@example.com',
			password: 'password123',
			username: 'testuser',
		};

		it('should create a new user and return token on successful registration', async () => {
			// Arrange
			const req = mockRequest({
				body: validRegisterData,
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			const mockNewUser = {
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

			// Mock no existing users
			mockedUserFindOne.mockResolvedValue(null);
			// Mock successful user creation
			mockedUserCreate.mockResolvedValue(mockNewUser as any);
			// Mock password hashing
			mockedBcryptHash.mockResolvedValue('hashed-password');
			// Mock JWT token generation
			mockedJwtSign.mockReturnValue('mock-jwt-token');

			// Act
			await register(req, res);

			// Assert
			expect(mockedUserFindOne).toHaveBeenCalledTimes(2); // Check email and username
			expect(mockedBcryptHash).toHaveBeenCalledWith('password123', 12);
			expect(mockedUserCreate).toHaveBeenCalledWith({
				email: 'test@example.com',
				username: 'testuser',
				password_hash: 'hashed-password',
				role: 'user',
				status: 'pending',
				email_verified: false,
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			});
			expect(mockedJwtSign).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				token: 'mock-jwt-token',
				user: expect.objectContaining({
					user_id: expect.any(String),
					email: 'test@example.com',
					username: 'testuser',
				}),
				message:
					'Account created successfully. Please check your email to verify your account.',
			});
			expect(mockedAuditLogInfo).toHaveBeenCalledTimes(2); // Registration attempt and success
		});

		it('should return 400 when required fields are missing', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'test@example.com', password: 'password123' }, // Missing username
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Email, password, and username are required',
			});
		});

		it('should return 400 when email format is invalid', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					...validRegisterData,
					email: 'invalid-email', // No @ symbol
				},
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Please provide a valid email address',
			});
		});

		it('should return 400 when email has multiple @ symbols', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					...validRegisterData,
					email: 'user@@example.com', // Multiple @ symbols
				},
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Please provide a valid email address',
			});
		});

		it('should return 400 when email is too long', async () => {
			// Arrange
			const longEmail = 'a'.repeat(250) + '@example.com'; // Over 254 character limit
			const req = mockRequest({
				body: {
					...validRegisterData,
					email: longEmail,
				},
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Please provide a valid email address',
			});
		});

		it('should return 400 when username format is invalid', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					...validRegisterData,
					username: 'ab', // Too short
				},
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error:
					'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
			});
		});

		it('should return 400 when password is too short', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					...validRegisterData,
					password: '123', // Too short
				},
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Password must be at least 8 characters long',
			});
		});

		it('should return 409 when email already exists', async () => {
			// Arrange
			const req = mockRequest({
				body: validRegisterData,
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Mock existing user with same email
			mockedUserFindOne.mockResolvedValueOnce({
				email: 'test@example.com',
			} as any);

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: 'An account with this email address already exists',
			});
			expect(mockedAuditLogWarn).toHaveBeenCalledWith(
				'Registration failed - email already exists',
				'auth-controller',
				expect.any(Object)
			);
		});

		it('should return 409 when username already exists', async () => {
			// Arrange
			const req = mockRequest({
				body: validRegisterData,
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Mock no existing user with email, but existing user with username
			mockedUserFindOne
				.mockResolvedValueOnce(null) // Email check
				.mockResolvedValueOnce({ username: 'testuser' } as any); // Username check

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: 'This username is already taken',
			});
			expect(mockedAuditLogWarn).toHaveBeenCalledWith(
				'Registration failed - username already exists',
				'auth-controller',
				expect.any(Object)
			);
		});

		it('should return 500 when database error occurs', async () => {
			// Arrange
			const req = mockRequest({
				body: validRegisterData,
				ip: '127.0.0.1',
				get: jest.fn().mockReturnValue('Mozilla/5.0 Test User Agent'),
			});
			const res = mockResponse();

			// Mock no existing users
			mockedUserFindOne.mockResolvedValue(null);
			// Mock password hashing
			mockedBcryptHash.mockResolvedValue('hashed-password');
			// Mock database error during user creation
			mockedUserCreate.mockRejectedValue(new Error('Database error'));

			// Act
			await register(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Registration failed. Please try again.',
			});
			expect(mockedAuditLogError).toHaveBeenCalledWith(
				'User registration failed',
				'auth-controller',
				expect.any(Object)
			);
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
				'password123',
				expect.any(Object)
			);
			expect(mockedJwtVerify).toHaveBeenCalledWith(mockToken, 'test-secret');
			expect(res.json).toHaveBeenCalledWith({
				token: mockToken,
				message: 'Login successful',
			});
			expect(res.status).toHaveBeenCalledWith(200); // Login returns 200 status
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
				'wrongpassword',
				expect.any(Object)
			);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should return 401 when an unknown error occurs', async () => {
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
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Authentication failed',
			});
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
				email_verified: true,
				failed_login_attempts: 0,
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
