import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateUser } from './auth.service';

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

jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(),
	verify: jest.fn(),
}));

import User from '../models/User';

describe('authenticateUser', () => {
	it('should return a token for valid credentials', async () => {
		const mockUser = {
			user_id: 1,
			email: 'test@example.com',
			username: 'testuser',
			password_hash: 'hashedPassword',
			role: 'user',
			status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
			email_verified: false,
			failed_login_attempts: 0,
			preferences: { theme: 'dark' as 'dark' | 'light' },
			last_login: null,
			save: jest.fn().mockResolvedValue(true),
		};

		(User.findOne as jest.Mock).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(jwt.sign as jest.Mock).mockReturnValue('mock-token');

		const token = await authenticateUser('test@example.com', 'password123');

		expect(token).toBe('mock-token');
		expect(jwt.sign).toHaveBeenCalledWith(
			{
				user_id: mockUser.user_id,
				email: mockUser.email,
				username: mockUser.username,
				role: mockUser.role,
				status: mockUser.status,
				email_verified: mockUser.email_verified,
				failed_login_attempts: mockUser.failed_login_attempts,
				preferences: mockUser.preferences,
			},
			expect.any(String),
			{ expiresIn: '7d' }
		);
		expect(mockUser.save).toHaveBeenCalled();
	});

	it('should throw an error for non-existent user', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);

		await expect(
			authenticateUser('test@example.com', 'password123')
		).rejects.toThrow('Invalid credentials');
	});

	it('should throw an error for invalid password', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			user_id: 1,
			email: 'test@example.com',
			username: 'testuser',
			password_hash: 'hashedPassword',
			failed_login_attempts: 0,
			locked_until: null,
			save: jest.fn().mockResolvedValue(true),
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(
			authenticateUser('test@example.com', 'wrongpassword')
		).rejects.toThrow('Invalid credentials');
	});
});
