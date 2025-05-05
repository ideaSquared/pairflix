import bcrypt from 'bcryptjs';
import User from '../models/User';
import {
	findUserByEmailService,
	updateEmailService,
	updatePasswordService,
} from './user.service';

jest.mock('../models/User');
jest.mock('bcryptjs');

describe('User Service', () => {
	describe('findUserByEmailService', () => {
		it('should return a user if found', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({
				user_id: 'user-2',
				email: 'test@example.com',
			});

			const user = await findUserByEmailService('test@example.com', {
				user_id: 'user-1',
			});
			expect(user).toEqual({ user_id: 'user-2', email: 'test@example.com' });
		});

		it('should return null if user not found or is the requesting user', async () => {
			(User.findOne as jest.Mock).mockResolvedValue(null);

			const user = await findUserByEmailService('test@example.com', {
				user_id: 'user-1',
			});
			expect(user).toBeNull();
		});
	});

	describe('updateEmailService', () => {
		it('should update email successfully', async () => {
			const mockUser = { save: jest.fn(), password_hash: 'hashedPassword' };
			(User.findOne as jest.Mock).mockResolvedValueOnce(null);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);

			const updatedUser = await updateEmailService(
				mockUser,
				'new@example.com',
				'password123'
			);
			expect(mockUser.save).toHaveBeenCalled();
			expect(updatedUser.email).toBe('new@example.com');
		});

		it('should throw an error if email is already in use', async () => {
			(User.findOne as jest.Mock).mockResolvedValueOnce({ user_id: 'user-2' });

			await expect(
				updateEmailService({}, 'new@example.com', 'password123')
			).rejects.toThrow('Email is already in use');
		});
	});

	describe('updatePasswordService', () => {
		it('should update password successfully', async () => {
			const mockUser = { save: jest.fn(), password_hash: 'hashedPassword' };
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

			await updatePasswordService(mockUser, 'oldPassword', 'newPassword');
			expect(mockUser.password_hash).toBe('newHashedPassword');
			expect(mockUser.save).toHaveBeenCalled();
		});

		it('should throw an error if current password is invalid', async () => {
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(
				updatePasswordService({}, 'oldPassword', 'newPassword')
			).rejects.toThrow('Invalid current password');
		});
	});
});
