import { Request, Response } from 'express';
import {
	findUserByEmailService,
	updateEmailService,
	updatePasswordService,
	updatePreferencesService,
	updateUsernameService,
} from '../services/user.service';

export const findByEmail = async (req: Request, res: Response) => {
	const { email } = req.query;
	if (!email || typeof email !== 'string') {
		return res.status(400).json({ error: 'Email query parameter is required' });
	}
	try {
		const user = await findUserByEmailService(email, req.user);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json(user);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateEmail = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	try {
		const { user, token } = await updateEmailService(req.user, email, password);
		res.json({
			message: 'Email updated successfully',
			user,
			token,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updatePassword = async (req: Request, res: Response) => {
	const { currentPassword, newPassword } = req.body;
	if (!currentPassword || !newPassword) {
		return res
			.status(400)
			.json({ error: 'Current password and new password are required' });
	}
	try {
		await updatePasswordService(req.user, currentPassword, newPassword);
		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateUsername = async (req: Request, res: Response) => {
	const { username } = req.body;
	if (!username) {
		return res.status(400).json({ error: 'Username is required' });
	}
	try {
		const { user, token } = await updateUsernameService(req.user, username);
		res.json({
			message: 'Username updated successfully',
			user,
			token,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updatePreferences = async (req: Request, res: Response) => {
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ error: 'Invalid preferences data' });
    }

    try {
        const { user, token } = await updatePreferencesService(preferences, req.user);
        res.json({ user, token });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
};
