import type { Request, Response } from 'express';
import { activityService, ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import {
	findUserByEmailService,
	updateEmailService,
	updatePasswordService,
	updatePreferencesService,
	updateUsernameService,
} from '../services/user.service';

// Define types for request body validation
interface UserPreferences {
	theme?: 'light' | 'dark';
	viewStyle?: 'list' | 'grid';
	emailNotifications?: boolean;
	autoArchiveDays?: number;
	favoriteGenres?: string[];
}

interface UpdateEmailRequest {
	email: string;
	password: string;
}

interface UpdatePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

interface UpdateUsernameRequest {
	username: string;
}

interface UpdatePreferencesRequest {
	preferences: UserPreferences;
}

// Type guard functions
const isValidPreferences = (obj: unknown): obj is UserPreferences => {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const preferences = obj as Record<string, unknown>;

	return (
		(preferences.theme === undefined ||
			(typeof preferences.theme === 'string' &&
				['light', 'dark'].includes(preferences.theme))) &&
		(preferences.viewStyle === undefined ||
			(typeof preferences.viewStyle === 'string' &&
				['list', 'grid'].includes(preferences.viewStyle))) &&
		(preferences.emailNotifications === undefined ||
			typeof preferences.emailNotifications === 'boolean') &&
		(preferences.autoArchiveDays === undefined ||
			typeof preferences.autoArchiveDays === 'number') &&
		(preferences.favoriteGenres === undefined ||
			(Array.isArray(preferences.favoriteGenres) &&
				preferences.favoriteGenres.every(genre => typeof genre === 'string')))
	);
};

export const findByEmail = async (req: Request, res: Response) => {
	const { email } = req.query;
	if (!email || typeof email !== 'string') {
		return res.status(400).json({ error: 'Email query parameter is required' });
	}
	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Audit log for user lookup attempt
		await auditLogService.info('User lookup attempt', 'user-controller', {
			userId: req.user.user_id,
			searchedEmail: email,
			ip: req.ip ?? 'unknown',
		});

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
	const { email, password } = req.body as UpdateEmailRequest;

	// Type validation
	if (
		!email ||
		typeof email !== 'string' ||
		!password ||
		typeof password !== 'string'
	) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Audit log for email update attempt
		await auditLogService.info('Email update attempt', 'user-controller', {
			userId: req.user.user_id,
			newEmail: email,
			ip: req.ip ?? 'unknown',
		});

		const { user, token } = await updateEmailService(req.user, email, password);

		// Email changes are private and shouldn't be shown to other users
		// This should be logged in the audit log instead

		// Audit log for successful email update
		await auditLogService.info(
			'Email updated successfully',
			'user-controller',
			{
				userId: user.user_id,
				oldEmail: req.user.email,
				newEmail: email,
			}
		);

		res.json({
			message: 'Email updated successfully',
			user,
			token,
		});
	} catch (error) {
		// Audit log for email update failure
		await auditLogService.warn('Email update failed', 'user-controller', {
			userId: req.user?.user_id,
			attemptedEmail: email,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updatePassword = async (req: Request, res: Response) => {
	const { currentPassword, newPassword } = req.body as UpdatePasswordRequest;

	// Type validation
	if (
		!currentPassword ||
		typeof currentPassword !== 'string' ||
		!newPassword ||
		typeof newPassword !== 'string'
	) {
		return res
			.status(400)
			.json({ error: 'Current password and new password are required' });
	}

	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Audit log for password update attempt
		await auditLogService.info('Password update attempt', 'user-controller', {
			userId: req.user.user_id,
			ip: req.ip ?? 'unknown',
		});

		await updatePasswordService(req.user, currentPassword, newPassword);

		// Password changes are security-sensitive and shouldn't be shown to other users
		// This should be logged in the audit log instead

		// Audit log for successful password update
		await auditLogService.info(
			'Password updated successfully',
			'user-controller',
			{
				userId: req.user.user_id,
			}
		);

		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		// Audit log for password update failure
		await auditLogService.warn('Password update failed', 'user-controller', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateUsername = async (req: Request, res: Response) => {
	const { username } = req.body as UpdateUsernameRequest;

	// Type validation
	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: 'Username is required' });
	}

	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Audit log for username update attempt
		await auditLogService.info('Username update attempt', 'user-controller', {
			userId: req.user.user_id,
			currentUsername: req.user.username,
			newUsername: username,
			ip: req.ip ?? 'unknown',
		});

		const { user, token } = await updateUsernameService(req.user, username);

		// Username changes are visible and relevant to other users
		await activityService.logActivity(
			user.user_id,
			ActivityType.USER_PROFILE_UPDATE,
			{ field: 'username', newUsername: username }
		);

		// Audit log for successful username update
		await auditLogService.info(
			'Username updated successfully',
			'user-controller',
			{
				userId: user.user_id,
				oldUsername: req.user.username,
				newUsername: username,
			}
		);

		res.json({
			message: 'Username updated successfully',
			user,
			token,
		});
	} catch (error) {
		// Audit log for username update failure
		await auditLogService.warn('Username update failed', 'user-controller', {
			userId: req.user?.user_id,
			attemptedUsername: username,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updatePreferences = async (req: Request, res: Response) => {
	const { preferences } = req.body as UpdatePreferencesRequest;

	// Type validation
	if (!preferences || !isValidPreferences(preferences)) {
		return res.status(400).json({ error: 'Invalid preferences data' });
	}

	try {
		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Audit log for preferences update attempt
		await auditLogService.info(
			'Preferences update attempt',
			'user-controller',
			{
				userId: req.user.user_id,
				preferences: preferences as Record<string, unknown>,
				ip: req.ip ?? 'unknown',
			}
		);

		const { user, token } = await updatePreferencesService(
			preferences as Record<string, unknown>,
			req.user
		);

		// Only log favorite genre changes as they're relevant to others
		if (preferences.favoriteGenres) {
			await activityService.logActivity(
				user.user_id,
				ActivityType.USER_PROFILE_UPDATE,
				{
					field: 'favoriteGenres',
					genres: preferences.favoriteGenres,
				}
			);
		}

		// Audit log for successful preferences update
		await auditLogService.info(
			'Preferences updated successfully',
			'user-controller',
			{
				userId: user.user_id,
				updatedPreferences: preferences as Record<string, unknown>,
			}
		);

		res.json({ user, token });
	} catch (error) {
		// Audit log for preferences update failure
		await auditLogService.warn('Preferences update failed', 'user-controller', {
			userId: req.user?.user_id,
			attemptedPreferences: preferences as Record<string, unknown>,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
