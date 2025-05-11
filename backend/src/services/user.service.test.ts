import bcrypt from 'bcryptjs';
import User from '../models/User';
import {
	findUserByEmailService,
	updateEmailService,
	updatePasswordService,
	updateUsernameService,
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
			// Fix: add email property to mockUser
			const mockUser = { 
				save: jest.fn(), 
				password_hash: 'hashedPassword',
				email: ''  // Add email property that will be updated
			};
			(User.findOne as jest.Mock).mockResolvedValueOnce(null);
			(User.findByPk as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			
			// Create mock JWT
			jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue('new-token');

			const result = await updateEmailService(
				{ user_id: 'test-user-id' },
				'new@example.com',
				'password123'
			);
			expect(mockUser.save).toHaveBeenCalled();
			expect(mockUser.email).toBe('new@example.com');
			expect(result.user).toBe(mockUser);
			expect(result.token).toBe('new-token');
		});

		it('should throw an error if email is already in use', async () => {
			(User.findOne as jest.Mock).mockResolvedValueOnce({ user_id: 'user-2' });

			await expect(
				updateEmailService({ user_id: 'test-user-id' }, 'new@example.com', 'password123')
			).rejects.toThrow('Email is already in use');
		});
	});

	describe('updatePasswordService', () => {
		it('should update password successfully', async () => {
			const mockUser = { save: jest.fn(), password_hash: 'hashedPassword' };
			(User.findByPk as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

			await updatePasswordService(
				{ user_id: 'test-user-id' }, 
				'oldPassword', 
				'newPassword'
			);
			expect(mockUser.password_hash).toBe('newHashedPassword');
			expect(mockUser.save).toHaveBeenCalled();
		});

		it('should throw an error if current password is invalid', async () => {
			const mockUser = { password_hash: 'hashedPassword' };
			(User.findByPk as jest.Mock).mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(
				updatePasswordService({ user_id: 'test-user-id' }, 'oldPassword', 'newPassword')
			).rejects.toThrow('Invalid current password');
		});
	});

	describe('updateUsernameService', () => {
		it('should update username successfully', async () => {
			// Fix: add username property to mockUser
			const mockUser = { 
				save: jest.fn(), 
				username: 'oldusername' 
			};
			(User.findOne as jest.Mock).mockResolvedValueOnce(null);
			(User.findByPk as jest.Mock).mockResolvedValue(mockUser);
			
			// Create mock JWT
			jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue('new-token');

			const result = await updateUsernameService(
				{ user_id: 'test-user-id' },
				'newusername'
			);
			expect(mockUser.save).toHaveBeenCalled();
			expect(mockUser.username).toBe('newusername');
			expect(result.user).toBe(mockUser);
			expect(result.token).toBe('new-token');
		});

		it('should throw an error if username is already in use', async () => {
			(User.findOne as jest.Mock).mockResolvedValueOnce({ user_id: 'user-2' });

			await expect(
				updateUsernameService({ user_id: 'test-user-id' }, 'existingname')
			).rejects.toThrow('Username is already in use');
		});

		it('should throw an error if username format is invalid', async () => {
			await expect(
				updateUsernameService({ user_id: 'test-user-id' }, 'inv@lid!')
			).rejects.toThrow(
				'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
			);

			await expect(
				updateUsernameService({ user_id: 'test-user-id' }, 'ab')
			).rejects.toThrow(
				'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
			);
		});
	});
});
