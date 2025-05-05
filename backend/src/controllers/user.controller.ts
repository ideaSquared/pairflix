import bcrypt from 'bcryptjs';
import { Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

export const updatePassword = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { currentPassword, newPassword } = req.body;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = await User.findByPk(user_id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const validPassword = await bcrypt.compare(
			currentPassword,
			user.password_hash
		);
		if (!validPassword) {
			return res.status(401).json({ error: 'Current password is incorrect' });
		}

		const newPasswordHash = await bcrypt.hash(newPassword, 10);
		await user.update({ password_hash: newPasswordHash });

		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Update password error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateEmail = async (req: AuthenticatedRequest, res: Response) => {
	const { email, password } = req.body;
	const user_id = req.user?.user_id;

	if (!user_id) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = await User.findByPk(user_id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			return res.status(401).json({ error: 'Password is incorrect' });
		}

		// Check if email is already taken by another user
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser && existingUser.user_id !== user_id) {
			return res.status(400).json({ error: 'Email is already in use' });
		}

		await user.update({ email });
		res.json({ message: 'Email updated successfully' });
	} catch (error) {
		console.error('Update email error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const findByEmail = async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.query;
    const requestingUserId = req.user?.user_id;

    if (!requestingUserId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'email']  // Only return safe fields
        });

        if (!user || user.user_id === requestingUserId) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Find user by email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
