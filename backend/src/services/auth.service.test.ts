import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateUser } from './auth.service';

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authenticateUser', () => {
	it('should return a token for valid credentials', async () => {
		(User.findOne as jest.Mock).mockResolvedValue({
			user_id: 1,
			email: 'test@example.com',
			password_hash: 'hashedPassword',
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(jwt.sign as jest.Mock).mockReturnValue('mock-token');

		const token = await authenticateUser('test@example.com', 'password123');
		expect(token).toBe('mock-token');
	});

	it('should throw an error for invalid credentials', async () => {
		(User.findOne as jest.Mock).mockResolvedValue(null);

		await expect(
			authenticateUser('test@example.com', 'password123')
		).rejects.toThrow('Invalid credentials');
	});
});
