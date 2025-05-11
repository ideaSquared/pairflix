import * as userService from '../services/user.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import {
	findByEmail,
	updateEmail,
	updatePassword,
	updatePreferences,
	updateUsername,
} from './user.controller';

// Mock the user service
jest.mock('../services/user.service', () => ({
	findUserByEmailService: jest.fn(),
	updateEmailService: jest.fn(),
	updatePasswordService: jest.fn(),
	updatePreferencesService: jest.fn(),
	updateUsernameService: jest.fn(),
}));

describe('User Controller', () => {
	beforeEach(() => {
		resetMocks();
	});

	describe('findByEmail', () => {
		it('should return a user when found', async () => {
			// Arrange
			const mockEmail = 'test@example.com';
			const req = mockRequest({
				query: { email: mockEmail },
			});
			const res = mockResponse();

			const mockFoundUser = {
				user_id: 'found-user-id',
				email: mockEmail,
				username: 'founduser',
			};

			(userService.findUserByEmailService as jest.Mock).mockResolvedValue(
				mockFoundUser
			);

			// Act
			await findByEmail(req, res);

			// Assert
			expect(userService.findUserByEmailService).toHaveBeenCalledWith(
				mockEmail,
				req.user
			);
			expect(res.json).toHaveBeenCalledWith(mockFoundUser);
		});

		it('should return 404 when user is not found', async () => {
			// Arrange
			const mockEmail = 'notfound@example.com';
			const req = mockRequest({
				query: { email: mockEmail },
			});
			const res = mockResponse();

			(userService.findUserByEmailService as jest.Mock).mockResolvedValue(null);

			// Act
			await findByEmail(req, res);

			// Assert
			expect(userService.findUserByEmailService).toHaveBeenCalledWith(
				mockEmail,
				req.user
			);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
		});

		it('should return 400 when email parameter is missing', async () => {
			// Arrange
			const req = mockRequest({
				query: {}, // No email parameter
			});
			const res = mockResponse();

			// Act
			await findByEmail(req, res);

			// Assert
			expect(userService.findUserByEmailService).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Email query parameter is required',
			});
		});

		it('should handle errors from the service', async () => {
			// Arrange
			const req = mockRequest({
				query: { email: 'test@example.com' },
			});
			const res = mockResponse();

			(userService.findUserByEmailService as jest.Mock).mockRejectedValue(
				new Error('Service error')
			);

			// Act
			await findByEmail(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	});

	describe('updateEmail', () => {
		it('should update email successfully', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					email: 'new@example.com',
					password: 'password123',
				},
			});
			const res = mockResponse();

			const mockResult = {
				user: {
					user_id: 'test-user-id',
					email: 'new@example.com',
					username: 'testuser',
				},
				token: 'new-token',
			};

			(userService.updateEmailService as jest.Mock).mockResolvedValue(
				mockResult
			);

			// Act
			await updateEmail(req, res);

			// Assert
			expect(userService.updateEmailService).toHaveBeenCalledWith(
				req.user,
				'new@example.com',
				'password123'
			);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Email updated successfully',
				user: mockResult.user,
				token: mockResult.token,
			});
		});

		it('should return 400 when email or password is missing', async () => {
			// Arrange - missing password
			const req1 = mockRequest({
				body: { email: 'new@example.com' },
			});
			const res1 = mockResponse();

			// Act
			await updateEmail(req1, res1);

			// Assert
			expect(userService.updateEmailService).not.toHaveBeenCalled();
			expect(res1.status).toHaveBeenCalledWith(400);
			expect(res1.json).toHaveBeenCalledWith({
				error: 'Email and password are required',
			});

			// Arrange - missing email
			const req2 = mockRequest({
				body: { password: 'password123' },
			});
			const res2 = mockResponse();

			// Act
			await updateEmail(req2, res2);

			// Assert
			expect(userService.updateEmailService).not.toHaveBeenCalled();
			expect(res2.status).toHaveBeenCalledWith(400);
			expect(res2.json).toHaveBeenCalledWith({
				error: 'Email and password are required',
			});
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					email: 'new@example.com',
					password: 'password123',
				},
			});
			const res = mockResponse();

			const errorMessage = 'Email is already in use';
			(userService.updateEmailService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await updateEmail(req, res);

			// Assert
			expect(userService.updateEmailService).toHaveBeenCalledWith(
				req.user,
				'new@example.com',
				'password123'
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});
	});

	describe('updatePassword', () => {
		it('should update password successfully', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					currentPassword: 'oldpassword',
					newPassword: 'newpassword123',
				},
			});
			const res = mockResponse();

			(userService.updatePasswordService as jest.Mock).mockResolvedValue(
				undefined
			);

			// Act
			await updatePassword(req, res);

			// Assert
			expect(userService.updatePasswordService).toHaveBeenCalledWith(
				req.user,
				'oldpassword',
				'newpassword123'
			);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Password updated successfully',
			});
		});

		it('should return 400 when passwords are missing', async () => {
			// Arrange - missing current password
			const req1 = mockRequest({
				body: { newPassword: 'newpassword123' },
			});
			const res1 = mockResponse();

			// Act
			await updatePassword(req1, res1);

			// Assert
			expect(userService.updatePasswordService).not.toHaveBeenCalled();
			expect(res1.status).toHaveBeenCalledWith(400);
			expect(res1.json).toHaveBeenCalledWith({
				error: 'Current password and new password are required',
			});

			// Arrange - missing new password
			const req2 = mockRequest({
				body: { currentPassword: 'oldpassword' },
			});
			const res2 = mockResponse();

			// Act
			await updatePassword(req2, res2);

			// Assert
			expect(userService.updatePasswordService).not.toHaveBeenCalled();
			expect(res2.status).toHaveBeenCalledWith(400);
			expect(res2.json).toHaveBeenCalledWith({
				error: 'Current password and new password are required',
			});
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					currentPassword: 'oldpassword',
					newPassword: 'newpassword123',
				},
			});
			const res = mockResponse();

			const errorMessage = 'Invalid current password';
			(userService.updatePasswordService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await updatePassword(req, res);

			// Assert
			expect(userService.updatePasswordService).toHaveBeenCalledWith(
				req.user,
				'oldpassword',
				'newpassword123'
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});
	});

	describe('updateUsername', () => {
		it('should update username successfully', async () => {
			// Arrange
			const req = mockRequest({
				body: { username: 'newusername' },
			});
			const res = mockResponse();

			const mockResult = {
				user: {
					user_id: 'test-user-id',
					email: 'test@example.com',
					username: 'newusername',
				},
				token: 'new-token',
			};

			(userService.updateUsernameService as jest.Mock).mockResolvedValue(
				mockResult
			);

			// Act
			await updateUsername(req, res);

			// Assert
			expect(userService.updateUsernameService).toHaveBeenCalledWith(
				req.user,
				'newusername'
			);
			expect(res.json).toHaveBeenCalledWith({
				message: 'Username updated successfully',
				user: mockResult.user,
				token: mockResult.token,
			});
		});

		it('should return 400 when username is missing', async () => {
			// Arrange
			const req = mockRequest({
				body: {}, // No username
			});
			const res = mockResponse();

			// Act
			await updateUsername(req, res);

			// Assert
			expect(userService.updateUsernameService).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				body: { username: 'newusername' },
			});
			const res = mockResponse();

			const errorMessage = 'Username is already in use';
			(userService.updateUsernameService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await updateUsername(req, res);

			// Assert
			expect(userService.updateUsernameService).toHaveBeenCalledWith(
				req.user,
				'newusername'
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});
	});

	describe('updatePreferences', () => {
		it('should update preferences successfully', async () => {
			// Arrange
			const mockPreferences = {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 15,
				favoriteGenres: ['action', 'comedy'],
			};

			const req = mockRequest({
				body: { preferences: mockPreferences },
			});
			const res = mockResponse();

			const mockResult = {
				user: {
					user_id: 'test-user-id',
					email: 'test@example.com',
					username: 'testuser',
					preferences: mockPreferences,
				},
				token: 'new-token',
			};

			(userService.updatePreferencesService as jest.Mock).mockResolvedValue(
				mockResult
			);

			// Act
			await updatePreferences(req, res);

			// Assert
			expect(userService.updatePreferencesService).toHaveBeenCalledWith(
				mockPreferences,
				req.user
			);
			expect(res.json).toHaveBeenCalledWith({
				user: mockResult.user,
				token: mockResult.token,
			});
		});

		it('should return 400 when preferences are invalid', async () => {
			// Arrange - missing preferences
			const req1 = mockRequest({
				body: {}, // No preferences
			});
			const res1 = mockResponse();

			// Act
			await updatePreferences(req1, res1);

			// Assert
			expect(userService.updatePreferencesService).not.toHaveBeenCalled();
			expect(res1.status).toHaveBeenCalledWith(400);
			expect(res1.json).toHaveBeenCalledWith({
				error: 'Invalid preferences data',
			});

			// Arrange - preferences not an object
			const req2 = mockRequest({
				body: { preferences: 'not an object' },
			});
			const res2 = mockResponse();

			// Act
			await updatePreferences(req2, res2);

			// Assert
			expect(userService.updatePreferencesService).not.toHaveBeenCalled();
			expect(res2.status).toHaveBeenCalledWith(400);
			expect(res2.json).toHaveBeenCalledWith({
				error: 'Invalid preferences data',
			});
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					preferences: { theme: 'light' },
				},
			});
			const res = mockResponse();

			const errorMessage = 'Invalid preference data';
			(userService.updatePreferencesService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await updatePreferences(req, res);

			// Assert
			expect(userService.updatePreferencesService).toHaveBeenCalledWith(
				{ theme: 'light' },
				req.user
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});
	});
});
