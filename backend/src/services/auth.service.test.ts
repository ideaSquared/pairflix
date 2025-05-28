import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateUser } from './auth.service';

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authenticateUser', () => {
	it('should return a token for valid credentials', async () => {
		const mockUser = {
			user_id: 1,
			email: 'test@example.com',
			username: 'testuser',
			password_hash: 'hashedPassword',
			role: 'user',
			status: 'active',
			preferences: { theme: 'dark' },
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
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(
			authenticateUser('test@example.com', 'wrongpassword')
		).rejects.toThrow('Invalid credentials');
	});
});
