import * as authService from '../services/auth.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import { getCurrentUser, login } from './auth.controller';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
	authenticateUser: jest.fn(),
}));

describe('Auth Controller', () => {
	beforeEach(() => {
		resetMocks();
	});

	describe('login', () => {
		it('should return a token when credentials are valid', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'test@example.com', password: 'password123' },
			});
			const res = mockResponse();
			const mockToken = 'valid-jwt-token';

			// Mock the authenticateUser service to return a token
			(authService.authenticateUser as jest.Mock).mockResolvedValue(mockToken);

			// Act
			await login(req, res);

			// Assert
			expect(authService.authenticateUser).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
			expect(res.json).toHaveBeenCalledWith({ token: mockToken });
			expect(res.status).not.toHaveBeenCalled(); // Should not call status for success cases
		});

		it('should return 401 when credentials are invalid', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'wrong@example.com', password: 'wrongpassword' },
			});
			const res = mockResponse();

			// Mock the authenticateUser service to throw an error
			const errorMessage = 'Invalid credentials';
			(authService.authenticateUser as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await login(req, res);

			// Assert
			expect(authService.authenticateUser).toHaveBeenCalledWith(
				'wrong@example.com',
				'wrongpassword'
			);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should return 500 when an unknown error occurs', async () => {
			// Arrange
			const req = mockRequest({
				body: { email: 'test@example.com', password: 'password123' },
			});
			const res = mockResponse();

			// Mock the authenticateUser service to throw a non-Error object
			(authService.authenticateUser as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await login(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
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
				preferences: {
					theme: 'dark' as 'dark' | 'light',
					viewStyle: 'grid' as 'grid' | 'list',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [] as string[],
				},
			};

			const req = mockRequest({ user: mockUser });
			const res = mockResponse();

			// Act
			await getCurrentUser(req, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith(mockUser);
		});

		it('should handle errors and return 500', async () => {
			// Arrange
			// Create a mock request with no user to trigger an error
			const req = mockRequest({
				user: undefined as any, // Using type assertion to bypass type checking
			});
			const res = mockResponse();

			// Act
			await getCurrentUser(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});
});
