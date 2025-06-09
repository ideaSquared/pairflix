import bcrypt from 'bcryptjs';
import {
	findUserByEmailService,
	updateEmailService,
	updatePasswordService,
	updatePreferencesService,
	updateUsernameService,
} from './user.service';

// Mock the User model
jest.mock('../models/User', () => ({
	__esModule: true,
	default: {
		findOne: jest.fn(),
		findByPk: jest.fn(),
	},
}));

jest.mock('bcryptjs', () => ({
	compare: jest.fn(),
	hash: jest.fn(),
}));

jest.mock('./auth.service', () => ({
	generateToken: jest.fn(),
}));

import User from '../models/User';
import { generateToken } from './auth.service';

const mockGenerateToken = generateToken as jest.MockedFunction<
	typeof generateToken
>;

// Get the mocked functions from the mocked User model
const mockFindOne = User.findOne as jest.MockedFunction<typeof User.findOne>;
const mockFindByPk = User.findByPk as jest.MockedFunction<typeof User.findByPk>;

// Helper function to create mock AuthenticatedUser
const createMockAuthenticatedUser = (overrides = {}) => ({
	user_id: 'test-user-id',
	email: 'test@example.com',
	username: 'testuser',
	role: 'user',
	status: 'active' as const,
	preferences: {
		theme: 'dark' as const,
		viewStyle: 'grid' as const,
		emailNotifications: true,
		autoArchiveDays: 30,
		favoriteGenres: [],
	},
	...overrides,
});

describe('User Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset all mocks
		mockFindOne.mockReset();
		mockFindByPk.mockReset();
	});

	describe('findUserByEmailService', () => {
		it('should return a user if found', async () => {
			const mockFoundUser = {
				user_id: 'user-2',
				email: 'found@example.com',
				username: 'founduser',
				role: 'user',
				status: 'active',
			};
			mockFindOne.mockResolvedValue(mockFoundUser as any);

			const requestingUser = createMockAuthenticatedUser({ user_id: 'user-1' });
			const result = await findUserByEmailService(
				'found@example.com',
				requestingUser
			);

			expect(result).toEqual(mockFoundUser);
		});

		it('should return null if user not found or is the requesting user', async () => {
			mockFindOne.mockResolvedValue(null);

			const requestingUser = createMockAuthenticatedUser({ user_id: 'user-1' });
			const result = await findUserByEmailService(
				'test@example.com',
				requestingUser
			);

			expect(result).toBeNull();
		});
	});

	describe('updateEmailService', () => {
		it('should update email successfully', async () => {
			const mockUser = {
				save: jest.fn().mockResolvedValue(undefined),
				password_hash: 'hashedPassword',
				email: '',
			};
			mockFindOne.mockResolvedValueOnce(null);
			mockFindByPk.mockResolvedValue(mockUser as any);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			mockGenerateToken.mockReturnValue('new-token');

			const authUser = createMockAuthenticatedUser();
			const result = await updateEmailService(
				authUser,
				'new@example.com',
				'password123'
			);

			expect(mockUser.save).toHaveBeenCalled();
			expect(mockUser.email).toBe('new@example.com');
			expect(result.user).toBe(mockUser);
			expect(result.token).toBe('new-token');
		});

		it('should throw an error if email is already in use', async () => {
			const mockExistingUser = { user_id: 'user-2' };
			mockFindOne.mockResolvedValueOnce(mockExistingUser as any);

			const authUser = createMockAuthenticatedUser();
			await expect(
				updateEmailService(authUser, 'new@example.com', 'password123')
			).rejects.toThrow('Email is already in use');
		});
	});

	describe('updatePasswordService', () => {
		it('should update password successfully', async () => {
			const mockUser = {
				save: jest.fn().mockResolvedValue(undefined),
				password_hash: 'hashedPassword',
			};
			mockFindByPk.mockResolvedValue(mockUser as any);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

			const authUser = createMockAuthenticatedUser();
			await updatePasswordService(authUser, 'oldPassword', 'newPassword');

			expect(mockUser.password_hash).toBe('newHashedPassword');
			expect(mockUser.save).toHaveBeenCalled();
		});

		it('should throw an error if current password is invalid', async () => {
			const mockUser = { password_hash: 'hashedPassword' };
			mockFindByPk.mockResolvedValue(mockUser as any);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			const authUser = createMockAuthenticatedUser();
			await expect(
				updatePasswordService(authUser, 'oldPassword', 'newPassword')
			).rejects.toThrow('Invalid current password');
		});
	});

	describe('updateUsernameService', () => {
		it('should update username successfully', async () => {
			const mockUser = {
				save: jest.fn().mockResolvedValue(undefined),
				username: 'oldusername',
			};
			mockFindOne.mockResolvedValueOnce(null);
			mockFindByPk.mockResolvedValue(mockUser as any);
			mockGenerateToken.mockReturnValue('new-token');

			const authUser = createMockAuthenticatedUser();
			const result = await updateUsernameService(authUser, 'newusername');

			expect(mockUser.save).toHaveBeenCalled();
			expect(mockUser.username).toBe('newusername');
			expect(result.user).toBe(mockUser);
			expect(result.token).toBe('new-token');
		});

		it('should throw an error if username is already in use', async () => {
			const mockExistingUser = { user_id: 'user-2' };
			mockFindOne.mockResolvedValueOnce(mockExistingUser as any);

			const authUser = createMockAuthenticatedUser();
			await expect(
				updateUsernameService(authUser, 'existingname')
			).rejects.toThrow('Username is already in use');
		});

		it('should throw an error if username format is invalid', async () => {
			const authUser = createMockAuthenticatedUser();

			await expect(updateUsernameService(authUser, 'inv@lid!')).rejects.toThrow(
				'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
			);

			await expect(updateUsernameService(authUser, 'ab')).rejects.toThrow(
				'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
			);
		});
	});

	describe('updatePreferencesService', () => {
		it('should update preferences successfully', async () => {
			const mockUser = {
				save: jest.fn().mockResolvedValue(undefined),
				preferences: { theme: 'dark' },
			};
			mockFindByPk.mockResolvedValue(mockUser as any);
			mockGenerateToken.mockReturnValue('new-token');

			const authUser = createMockAuthenticatedUser();
			const result = await updatePreferencesService(
				{ theme: 'light', emailNotifications: true },
				authUser
			);

			expect(mockUser.save).toHaveBeenCalled();
			expect(mockUser.preferences).toEqual({
				theme: 'light',
				emailNotifications: true,
			});
			expect(result.user).toBe(mockUser);
			expect(result.token).toBe('new-token');
		});

		it('should throw an error if user not found', async () => {
			mockFindByPk.mockResolvedValue(null);

			const authUser = createMockAuthenticatedUser();
			await expect(
				updatePreferencesService({ theme: 'light' }, authUser)
			).rejects.toThrow('User not found');
		});
	});
});
