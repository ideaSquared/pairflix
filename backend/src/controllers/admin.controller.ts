import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { ActivityLog } from '../models/ActivityLog';
import AuditLog from '../models/AuditLog';
import Content from '../models/Content';
import ContentReport from '../models/ContentReport';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import { activityService } from '../services/activity.service';
import { auditLogService, LogLevel } from '../services/audit.service';
import { settingsService } from '../services/settings.service';
import { statisticsService } from '../services/statistics.service';
import type { ActivityContext } from '../types';

// Import Express namespace to ensure the Request type includes user property
import '../middlewares/auth';

// User status type for validation
type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

/**
 * Get all recent audit logs
 */
export const getAuditLogs = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 100;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Use the auditLogService to get logs
		const data = await auditLogService.getRecentLogs(limit, offset);

		return res.status(200).json({ data });
	} catch (error) {
		console.error('Error fetching audit logs:', error);
		return res.status(500).json({ error: 'Failed to fetch audit logs' });
	}
};

/**
 * Get audit logs filtered by level
 */
export const getAuditLogsByLevel = async (req: Request, res: Response) => {
	try {
		const { level } = req.params;

		// Validate the level parameter
		if (!Object.values(LogLevel).includes(level as LogLevel)) {
			return res.status(400).json({
				error: 'Invalid log level',
				validLevels: Object.values(LogLevel),
			});
		}

		const limit = parseInt(req.query.limit as string, 10) || 100;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Use the auditLogService to get logs by level
		const data = await auditLogService.getLogsByLevel(
			level as LogLevel,
			limit,
			offset
		);

		return res.status(200).json({ data });
	} catch (error) {
		console.error('Error fetching audit logs by level:', error);
		return res.status(500).json({ error: 'Failed to fetch audit logs' });
	}
};

/**
 * Get unique log sources for filtering
 */
export const getLogSources = async (req: Request, res: Response) => {
	try {
		const sources = await AuditLog.findAll({
			attributes: ['source'],
			group: ['source'],
			order: [['source', 'ASC']],
		});

		return res.status(200).json({
			sources: sources.map(s => s.source),
		});
	} catch (error) {
		console.error('Error fetching log sources:', error);
		return res.status(500).json({ error: 'Failed to fetch log sources' });
	}
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (req: Request, res: Response) => {
	try {
		const stats = await auditLogService.getAuditLogStats();
		return res.status(200).json({ stats });
	} catch (error) {
		console.error('Error fetching audit log stats:', error);
		return res
			.status(500)
			.json({ error: 'Failed to fetch audit log statistics' });
	}
};

/**
 * Manually run log rotation
 */
export const runLogRotation = async (req: Request, res: Response) => {
	try {
		// Get custom retention periods from request if provided
		const requestData = req.body as Record<string, unknown>;
		const customRetention: Partial<Record<LogLevel, number>> | undefined =
			requestData.retentionDays as
				| Partial<Record<LogLevel, number>>
				| undefined;

		// Run the cleanup
		const deletedCount = await auditLogService.cleanupOldLogs(customRetention);

		return res.status(200).json({
			success: true,
			message: `Log rotation complete. Removed ${deletedCount} old logs.`,
		});
	} catch (error) {
		console.error('Error running log rotation:', error);
		return res.status(500).json({ error: 'Failed to run log rotation' });
	}
};

/**
 * Create a test log entry (useful for verification)
 */
export const createTestLog = async (req: Request, res: Response) => {
	try {
		const requestData = req.body as Record<string, unknown>;
		const level = requestData.level as string;
		const message = requestData.message as string;

		if (!level || !message) {
			return res.status(400).json({ error: 'Level and message are required' });
		}

		// Validate the level parameter
		if (!Object.values(LogLevel).includes(level as LogLevel)) {
			return res.status(400).json({
				error: 'Invalid log level',
				validLevels: Object.values(LogLevel),
			});
		}

		const log = await auditLogService.log(
			level as LogLevel,
			message,
			'admin-test',
			{
				testMode: true,
				timestamp: new Date(),
				userId: req.user?.user_id,
			}
		);

		return res.status(201).json({ log });
	} catch (error) {
		console.error('Error creating test log:', error);
		return res.status(500).json({ error: 'Failed to create test log' });
	}
};

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (req: Request, res: Response) => {
	try {
		// Parse query parameters
		const limit = parseInt(req.query.limit as string, 10) || 10;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const search = req.query.search as string;
		const role = req.query.role as string;
		const status = req.query.status as string;
		const sortBy = (req.query.sortBy as string) || 'created_at';
		const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

		// Build query conditions
		const where: Record<string | symbol, unknown> = {};

		// Add search filter for username or email
		if (search) {
			where[Op.or] = [
				{ username: { [Op.iLike]: `%${search}%` } },
				{ email: { [Op.iLike]: `%${search}%` } },
			];
		}

		// Add role filter
		if (role) {
			where.role = role;
		}

		// Add status filter - this assumes you have a status field or may need to be adjusted
		if (status) {
			where.status = status as UserStatus;
		}

		// Fetch users with pagination
		const users = await User.findAll({
			where,
			order: [[sortBy, sortOrder]],
			limit,
			offset,
			attributes: [
				'user_id',
				'username',
				'email',
				'status',
				'role',
				'preferences',
				'created_at',
				'last_login',
			],
		});

		// Get total count for pagination
		const totalCount = await User.count({ where });

		// Audit log for user listing
		await auditLogService.info('Listed users', 'admin-controller', {
			userId: req.user?.user_id,
			filters: {
				search,
				role,
				status,
				sortBy,
				sortOrder,
			},
			pagination: { limit, offset },
			totalCount,
		});

		return res.status(200).json({
			users,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + users.length < totalCount,
			},
		});
	} catch (error) {
		console.error('Error fetching users:', error);

		// Audit log for error
		await auditLogService.error('Failed to fetch users', 'admin-controller', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		return res.status(500).json({ error: 'Failed to fetch users' });
	}
};

/**
 * Get a single user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		const user = await User.findByPk(userId, {
			attributes: [
				'user_id',
				'username',
				'email',
				'role',
				'preferences',
				'created_at',
				'last_login',
			],
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Audit log for user retrieval
		await auditLogService.info('Retrieved user details', 'admin-controller', {
			adminId: req.user?.user_id,
			targetUserId: userId,
		});

		return res.status(200).json({ user });
	} catch (error) {
		console.error('Error fetching user:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch user details',
			'admin-controller',
			{
				userId: req.user?.user_id,
				targetUserId: req.params.userId,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch user details' });
	}
};

/**
 * Update a user's details
 */
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const updateData = req.body as Record<string, unknown>;
		const username = updateData.username as string | undefined;
		const email = updateData.email as string | undefined;
		const role = updateData.role as string | undefined;
		const status = updateData.status as UserStatus | undefined;

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Store original values for logging
		const originalValues = {
			username: user.username,
			email: user.email,
			role: user.role,
			status: user.status,
		};

		// Update user fields if provided
		if (username !== undefined) user.username = username;
		if (email !== undefined) user.email = email;
		if (role !== undefined) user.role = role;
		if (status !== undefined) {
			// Add status field to user if it doesn't exist
			user.set('status', status);
		}

		await user.save();

		// Get updated values for response
		const updatedUser = await User.findByPk(userId, {
			attributes: [
				'user_id',
				'username',
				'email',
				'role',
				'status',
				'preferences',
				'created_at',
				'last_login',
			],
		});

		// Audit log for user update
		await auditLogService.info('Updated user', 'admin-controller', {
			adminId: req.user?.user_id,
			targetUserId: userId,
			changes: {
				username:
					username !== undefined
						? { from: originalValues.username, to: username }
						: undefined,
				email:
					email !== undefined
						? { from: originalValues.email, to: email }
						: undefined,
				role:
					role !== undefined
						? { from: originalValues.role, to: role }
						: undefined,
				status:
					status !== undefined
						? { from: originalValues.status, to: status }
						: undefined,
			},
		});

		return res.status(200).json({
			user: updatedUser,
			message: 'User updated successfully',
		});
	} catch (error) {
		console.error('Error updating user:', error);

		// Audit log for error
		await auditLogService.error('Failed to update user', 'admin-controller', {
			userId: req.user?.user_id,
			targetUserId: req.params.userId,
			updates: req.body,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		return res.status(500).json({ error: 'Failed to update user' });
	}
};

/**
 * Delete a user
 */
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Store user details for logging
		const userDetails = {
			username: user.username,
			email: user.email,
			role: user.role,
		};

		// Delete the user
		await user.destroy();

		// Audit log for user deletion
		await auditLogService.warn('Deleted user', 'admin-controller', {
			adminId: req.user?.user_id,
			deletedUserId: userId,
			deletedUserDetails: userDetails,
		});

		return res.status(200).json({
			success: true,
			message: 'User deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting user:', error);

		// Audit log for error
		await auditLogService.error('Failed to delete user', 'admin-controller', {
			userId: req.user?.user_id,
			targetUserId: req.params.userId,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		return res.status(500).json({ error: 'Failed to delete user' });
	}
};

/**
 * Change a user's status (suspend, activate, etc.)
 */
export const changeUserStatus = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const requestData = req.body as Record<string, unknown>;
		const status = requestData.status as UserStatus;
		const reason = requestData.reason as string | undefined;

		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		if (
			!status ||
			!['active', 'inactive', 'suspended', 'pending', 'banned'].includes(status)
		) {
			return res.status(400).json({
				error: 'Valid status is required',
				validStatuses: ['active', 'inactive', 'suspended', 'pending', 'banned'],
			});
		}

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Store original status for logging
		const originalStatus = user.status;

		// Update user status
		user.status = status;
		await user.save();

		// Audit log for user status change
		await auditLogService.warn(
			`Changed user status to ${status}`,
			'admin-controller',
			{
				adminId: req.user?.user_id,
				targetUserId: userId,
				change: {
					from: originalStatus,
					to: status,
				},
				reason,
			}
		);

		return res.status(200).json({
			success: true,
			message: `User status changed to ${status} successfully`,
			user: {
				user_id: user.user_id,
				username: user.username,
				email: user.email,
				role: user.role,
				status: user.status,
				created_at: user.created_at,
				last_login: user.last_login,
			},
		});
	} catch (error) {
		console.error('Error changing user status:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to change user status',
			'admin-controller',
			{
				userId: req.user?.user_id,
				targetUserId: req.params.userId,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to change user status' });
	}
};

/**
 * Reset a user's password
 */
export const resetUserPassword = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Generate random password (8 characters)
		const newPassword = Math.random().toString(36).slice(-8);

		// Hash the new password
		const password_hash = await bcrypt.hash(newPassword, 10);

		// Update user's password
		user.password_hash = password_hash;
		await user.save();

		// Audit log for password reset
		await auditLogService.warn('Reset user password', 'admin-controller', {
			adminId: req.user?.user_id,
			targetUserId: userId,
			// Don't log the new password in audit logs for security reasons
			timestamp: new Date(),
		});

		return res.status(200).json({
			success: true,
			message: 'Password reset successful',
			newPassword,
			user: {
				user_id: user.user_id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		console.error('Error resetting user password:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to reset user password',
			'admin-controller',
			{
				userId: req.user?.user_id,
				targetUserId: req.params.userId,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to reset user password' });
	}
};

/**
 * Create a new user (admin function)
 */
export const createUser = async (req: Request, res: Response) => {
	try {
		const userData = req.body as Record<string, unknown>;
		const username = userData.username as string;
		const email = userData.email as string;
		const password = userData.password as string;
		const role = userData.role as string | undefined;
		const status = userData.status as UserStatus | undefined;

		// Validate required fields
		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ error: 'Username, email, and password are required' });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		// Validate username format
		if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
			return res.status(400).json({
				error:
					'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen',
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({
			where: {
				[Op.or]: [{ email }, { username }],
			},
		});

		if (existingUser) {
			const field = existingUser.email === email ? 'email' : 'username';
			return res
				.status(400)
				.json({ error: `User with this ${field} already exists` });
		}

		// Hash the password
		const password_hash = await bcrypt.hash(password, 10);

		// Create default preferences
		const preferences = {
			theme: 'dark' as 'dark' | 'light',
			viewStyle: 'grid' as 'grid' | 'list',
			emailNotifications: true,
			autoArchiveDays: 30,
			favoriteGenres: [] as string[],
		};

		// Create the new user
		const user = await User.create({
			username,
			email,
			password_hash,
			role: role ?? 'user',
			status: status ?? 'active',
			preferences,
		});

		// Audit log for user creation
		await auditLogService.info('Created new user', 'admin-controller', {
			adminId: req.user?.user_id,
			newUserId: user.user_id,
			username,
			email,
			role: user.role,
			status: user.status,
		});

		return res.status(201).json({
			success: true,
			message: 'User created successfully',
			user: {
				user_id: user.user_id,
				username: user.username,
				email: user.email,
				role: user.role,
				status: user.status,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error('Error creating user:', error);

		// Audit log for error
		await auditLogService.error('Failed to create user', 'admin-controller', {
			userId: req.user?.user_id,
			attemptedData: req.body,
			error: error instanceof Error ? error.message : 'Unknown error',
		});

		return res.status(500).json({ error: 'Failed to create user' });
	}
};

/**
 * Export data as CSV (Users list)
 */
export const exportUsersAsCsv = async (req: Request, res: Response) => {
	try {
		// Filter parameters (optional)
		const role = req.query.role as string;
		const status = req.query.status as string;

		// Build query conditions
		const where: Record<string, unknown> = {};

		// Add role filter
		if (role) {
			where.role = role;
		}

		// Add status filter
		if (status) {
			where.status = status;
		}

		// Fetch all users matching criteria
		const users = await User.findAll({
			where,
			attributes: [
				'user_id',
				'username',
				'email',
				'status',
				'role',
				'created_at',
				'last_login',
			],
			order: [['created_at', 'DESC']],
		});

		// Create CSV header
		let csv = 'User ID,Username,Email,Status,Role,Created At,Last Login\n';

		// Add rows
		users.forEach(user => {
			const created = user.created_at
				? new Date(user.created_at).toISOString()
				: '';
			const lastLogin = user.last_login
				? new Date(user.last_login).toISOString()
				: 'Never';

			csv += `${user.user_id},${user.username},${user.email},${user.status},${user.role},${created},${lastLogin}\n`;
		});

		// Audit log for CSV export
		await auditLogService.info('Exported users as CSV', 'admin-controller', {
			adminId: req.user?.user_id,
			filters: { role, status },
			usersCount: users.length,
		});

		// Set response headers
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

		return res.status(200).send(csv);
	} catch (error) {
		console.error('Error exporting users:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to export users as CSV',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to export users' });
	}
};

/**
 * Get all watchlist entries across all users (for moderation)
 */
export const getAllWatchlistEntries = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 10;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const userId = req.query.userId as string;
		const status = req.query.status as string;
		const mediaType = req.query.mediaType as string;

		// Build query conditions
		const where: Record<string, unknown> = {};

		if (userId) {
			where.user_id = userId;
		}

		if (status) {
			where.status = status;
		}

		if (mediaType) {
			where.media_type = mediaType;
		}

		const entries = await WatchlistEntry.findAll({
			where,
			order: [['created_at', 'DESC']],
			limit,
			offset,
			include: [{ model: User, attributes: ['username', 'email'] }],
		});

		// Get total count for pagination
		const totalCount = await WatchlistEntry.count({ where });

		// Audit log for admin viewing all watchlist entries
		await auditLogService.info(
			'Viewed all watchlist entries',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				filters: { userId, status, mediaType },
				pagination: { limit, offset },
			}
		);

		return res.status(200).json({
			entries,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + entries.length < totalCount,
			},
		});
	} catch (error) {
		console.error('Error fetching all watchlist entries:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch all watchlist entries',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch watchlist entries' });
	}
};

/**
 * Moderate a watchlist entry (e.g., remove inappropriate content)
 */
export const moderateWatchlistEntry = async (req: Request, res: Response) => {
	try {
		const { entryId } = req.params;
		const requestData = req.body as Record<string, unknown>;
		const action = requestData.action as string;
		const reason = requestData.reason as string;

		if (!['flag', 'remove', 'approve'].includes(action)) {
			return res.status(400).json({
				error: 'Invalid action',
				validActions: ['flag', 'remove', 'approve'],
			});
		}

		const entry = await WatchlistEntry.findByPk(entryId);

		if (!entry) {
			return res.status(404).json({ error: 'Watchlist entry not found' });
		}

		// Store original values for logging
		const originalValues = {
			status: entry.status,
			notes: entry.notes,
		};

		// Update entry status based on action
		if (action === 'flag') {
			entry.status = 'flagged';
			entry.notes = entry.notes ? `${entry.notes}; ${reason}` : reason;
		} else if (action === 'remove') {
			entry.status = 'removed';
			entry.notes = entry.notes ? `${entry.notes}; ${reason}` : reason;
		} else if (action === 'approve') {
			entry.status = 'active';
			entry.notes = entry.notes
				? `${entry.notes}; Approved by admin`
				: 'Approved by admin';
		}

		await entry.save();

		// Audit log for watchlist entry moderation
		await auditLogService.warn(
			'Moderated watchlist entry',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				entryId,
				userId: entry.user_id,
				action,
				reason,
				changes: {
					status: { from: originalValues.status, to: entry.status },
					notes: { from: originalValues.notes, to: entry.notes },
				},
			}
		);

		return res.status(200).json({
			success: true,
			message: `Watchlist entry ${action}ed successfully`,
			entry,
		});
	} catch (error) {
		console.error('Error moderating watchlist entry:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to moderate watchlist entry',
			'admin-controller',
			{
				userId: req.user?.user_id,
				entryId: req.params.entryId,
				action: (req.body as Record<string, unknown>).action as string,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to moderate watchlist entry' });
	}
};

/**
 * Get all matches for moderation
 */
export const getAllMatches = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 10;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const userId = req.query.userId as string;
		const status = req.query.status as string;

		// Build query conditions
		const where: Record<string | symbol, unknown> = {};

		if (userId) {
			where[Op.or] = [{ user_id_1: userId }, { user_id_2: userId }];
		}

		if (status) {
			where.status = status;
		}

		const matches = await Match.findAll({
			where,
			order: [['created_at', 'DESC']],
			limit,
			offset,
			include: [
				{ model: User, as: 'user1', attributes: ['username', 'email'] },
				{ model: User, as: 'user2', attributes: ['username', 'email'] },
				{
					model: WatchlistEntry,
					as: 'watchlistEntry',
					attributes: ['tmdb_id', 'media_type', 'status'], // Replace 'title' with existing fields
				},
			],
		});

		// Get total count for pagination
		const totalCount = await Match.count({ where });

		// Audit log for admin viewing all matches
		await auditLogService.info('Viewed all matches', 'admin-controller', {
			adminId: req.user?.user_id,
			filters: { userId, status },
			pagination: { limit, offset },
		});

		return res.status(200).json({
			matches,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + matches.length < totalCount,
			},
		});
	} catch (error) {
		console.error('Error fetching all matches:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch all matches',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch matches' });
	}
};

/**
 * Get system usage statistics and metrics
 */
export const getSystemMetrics = async (req: Request, res: Response) => {
	try {
		// Use our centralized statistics service instead of duplicate queries
		const metrics = await statisticsService.getSystemMetrics();

		// Audit log for system metrics retrieval
		await auditLogService.info('Retrieved system metrics', 'admin-controller', {
			userId: req.user?.user_id,
			timestamp: new Date(),
		});

		return res.status(200).json({ metrics });
	} catch (error) {
		console.error('Error fetching system metrics:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch system metrics',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch system metrics' });
	}
};

/**
 * Get detailed system statistics
 */
export const getSystemStats = async (req: Request, res: Response) => {
	try {
		// Use the centralized statistics service
		const stats = await statisticsService.getSystemStats();

		// Audit log for stats retrieval
		await auditLogService.info('Retrieved system stats', 'admin-controller', {
			adminId: req.user?.user_id,
			timestamp: new Date(),
		});

		return res.status(200).json(stats);
	} catch (error) {
		console.error('Error fetching system stats:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch system stats',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch system statistics' });
	}
};

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (req: Request, res: Response) => {
	try {
		const days = parseInt(req.query.days as string, 10) || 7;

		// Ensure days parameter is reasonable
		if (days < 1 || days > 90) {
			return res
				.status(400)
				.json({ error: 'Days parameter must be between 1 and 90' });
		}

		// Use our centralized statistics service
		const activityStats =
			await statisticsService.getDetailedActivityStats(days);

		// Audit log for activity stats retrieval
		await auditLogService.info('Retrieved activity stats', 'admin-controller', {
			userId: req.user?.user_id,
			days,
			timestamp: new Date(),
		});

		return res.status(200).json({
			timespan: { days, startDate: new Date(Date.now() - days * 86400000) },
			activityByDate: activityStats.activityByDate,
			activityByType: activityStats.activityByType,
			mostActiveUsers: activityStats.mostActiveUsers,
		});
	} catch (error) {
		console.error('Error fetching user activity stats:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch user activity stats',
			'admin-controller',
			{
				userId: req.user?.user_id,
				days: req.query.days,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to fetch user activity statistics' });
	}
};

/**
 * Get dashboard statistics for admin overview
 */
export const getDashboardStats = async (req: Request, res: Response) => {
	try {
		// Use our centralized statistics service
		const stats = await statisticsService.getDashboardStats();

		// Audit log for dashboard stats retrieval
		await auditLogService.info(
			'Retrieved dashboard stats',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				timestamp: new Date(),
			}
		);

		return res.status(200).json({ stats });
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch dashboard stats',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
	}
};

/**
 * Get all user activities across the site (Admin only)
 */
export const getAllActivities = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const action = req.query.action as string;
		const startDate = req.query.startDate as string;
		const endDate = req.query.endDate as string;

		// Build query conditions
		const where: Record<string | symbol, unknown> = {};

		// Filter by action if provided
		if (action) {
			where.action = action;
		}

		// Filter by date range if provided
		if (startDate || endDate) {
			where.created_at = {} as Record<symbol, Date>;

			if (startDate) {
				(where.created_at as Record<symbol, Date>)[Op.gte] = new Date(
					startDate
				);
			}

			if (endDate) {
				(where.created_at as Record<symbol, Date>)[Op.lte] = new Date(endDate);
			}
		}

		// Get activities for all users with user information
		const activities = await ActivityLog.findAll({
			where,
			order: [['created_at', 'DESC']],
			limit,
			offset,
			include: [
				{
					model: User,
					as: 'user',
					attributes: ['user_id', 'username', 'email'],
				},
			],
		});

		// Get total count for pagination
		const totalCount = await ActivityLog.count({ where });

		// Audit log for admin viewing all activities
		await auditLogService.info(
			'Viewed all user activities',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				filters: { action, startDate, endDate },
				pagination: { limit, offset },
			}
		);

		return res.status(200).json({
			activities,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + activities.length < totalCount,
			},
		});
	} catch (error) {
		console.error('Error fetching all activities:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch all activities',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to fetch activities' });
	}
};

/**
 * Get detailed activity analytics
 */
export const getActivityAnalytics = async (req: Request, res: Response) => {
	try {
		const days = parseInt(req.query.days as string, 10) || 30;
		const startDate = req.query.startDate
			? new Date(req.query.startDate as string)
			: new Date(Date.now() - days * 86400000);
		const endDate = req.query.endDate
			? new Date(req.query.endDate as string)
			: new Date();
		const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

		// Get all the activity data we need for comprehensive analytics
		const [
			popularActivities,
			timeline,
			contextStats,
			actionStats,
			userPatterns,
		] = await Promise.all([
			activityService.getMostPopularActivities(days),
			activityService.getActivityTimeline(startDate, endDate, groupBy),
			activityService.getActivityStats(days, 'context'),
			activityService.getActivityStats(days, 'action'),
			activityService.getUserActivityPatterns(undefined, days, 10),
		]);

		// Audit log for analytics retrieval
		await auditLogService.info(
			'Retrieved activity analytics',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				timeRange: { days, startDate, endDate },
			}
		);

		return res.status(200).json({
			timeRange: {
				days,
				startDate,
				endDate,
			},
			popularActivities,
			timeline,
			contextStats,
			actionStats,
			userPatterns,
		});
	} catch (error) {
		console.error('Error fetching activity analytics:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch activity analytics',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to fetch activity analytics' });
	}
};

/**
 * Get activities filtered by context (category)
 */
export const getActivitiesByContext = async (req: Request, res: Response) => {
	try {
		const context = req.params.context as ActivityContext;
		const action = req.query.action as string;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		if (
			!['watchlist', 'user', 'match', 'search', 'media', 'system'].includes(
				context
			)
		) {
			return res.status(400).json({
				error: 'Invalid context',
				validContexts: [
					'watchlist',
					'user',
					'match',
					'search',
					'media',
					'system',
				],
			});
		}

		const result = await activityService.getActivitiesByContext(
			context,
			action,
			limit,
			offset
		);

		// Audit log for activity retrieval by context
		await auditLogService.info(
			'Retrieved activities by context',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				context,
				action,
				pagination: { limit, offset },
			}
		);

		return res.status(200).json(result);
	} catch (error) {
		console.error('Error fetching activities by context:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch activities by context',
			'admin-controller',
			{
				userId: req.user?.user_id,
				context: req.params.context,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to fetch activities by context' });
	}
};

/**
 * Get user activity patterns
 */
export const getUserActivityPatterns = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const days = parseInt(req.query.days as string, 10) || 30;

		const patterns = await activityService.getUserActivityPatterns(
			userId,
			days
		);

		// Audit log for user activity patterns retrieval
		await auditLogService.info(
			'Retrieved user activity patterns',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				targetUserId: userId,
				days,
			}
		);

		return res.status(200).json({ patterns });
	} catch (error) {
		console.error('Error fetching user activity patterns:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch user activity patterns',
			'admin-controller',
			{
				userId: req.user?.user_id,
				targetUserId: req.params.userId,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to fetch user activity patterns' });
	}
};

/**
 * Get application settings
 */
export async function getAppSettings(req: Request, res: Response) {
	try {
		const settings = await settingsService.getSettings();

		// Audit log for settings retrieval
		await auditLogService.info('Retrieved app settings', 'admin-controller', {
			userId: req.user?.user_id,
			timestamp: new Date(),
		});

		return res.status(200).json({
			settings,
			fromCache: true,
			lastUpdated: new Date(),
		});
	} catch (error) {
		console.error('Error fetching application settings:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to fetch app settings',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to fetch application settings' });
	}
}

/**
 * Update application settings
 */
export async function updateAppSettings(req: Request, res: Response) {
	try {
		const requestData = req.body as Record<string, unknown>;
		const settings = requestData.settings as Record<string, unknown>;

		if (!settings) {
			return res.status(400).json({ error: 'Settings object is required' });
		}

		// Validate settings
		if (
			!settings.general ||
			!settings.security ||
			!settings.email ||
			!settings.features
		) {
			return res.status(400).json({
				error:
					'Invalid settings format. Required sections: general, security, email, features',
			});
		}

		// Update settings using the service
		const updatedSettings = await settingsService.updateSettings(
			settings,
			req.user?.user_id
		);

		return res.status(200).json({
			success: true,
			message: 'Settings updated successfully',
			settings: updatedSettings,
			lastUpdated: new Date(),
		});
	} catch (error) {
		console.error('Error updating application settings:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to update app settings',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res
			.status(500)
			.json({ error: 'Failed to update application settings' });
	}
}

/**
 * Clear server-side cache (for development/debugging)
 */
export async function clearCache(req: Request, res: Response) {
	try {
		// Clear settings cache using service
		settingsService.clearCache();

		// Audit log for cache clearing
		await auditLogService.warn('Cleared server cache', 'admin-controller', {
			userId: req.user?.user_id,
			timestamp: new Date(),
		});

		return res.status(200).json({
			success: true,
			message: 'Server cache cleared successfully',
		});
	} catch (error) {
		console.error('Error clearing cache:', error);

		// Audit log for error
		await auditLogService.error(
			'Failed to clear server cache',
			'admin-controller',
			{
				userId: req.user?.user_id,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

		return res.status(500).json({ error: 'Failed to clear server cache' });
	}
}

/**
 * Admin login endpoint
 */
export const adminLogin = async (req: Request, res: Response) => {
	const requestData = req.body as Record<string, unknown>;
	const email = requestData.email as string;
	const password = requestData.password as string;
	try {
		// Audit log - admin login attempt
		await auditLogService.info('Admin login attempt', 'admin-controller', {
			email,
			ip: req.ip,
			userAgent: req.get('user-agent'),
			timestamp: new Date(),
		});

		// Check if user exists and has admin role
		const user = await User.findOne({ where: { email } });

		if (!user) {
			await auditLogService.warn(
				'Admin login failed - user not found',
				'admin-controller',
				{
					email,
					ip: req.ip,
					timestamp: new Date(),
				}
			);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Verify the password
		const isPasswordValid = await bcrypt.compare(password, user.password_hash);

		if (!isPasswordValid) {
			await auditLogService.warn(
				'Admin login failed - invalid password',
				'admin-controller',
				{
					email,
					userId: user.user_id,
					ip: req.ip,
					timestamp: new Date(),
				}
			);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Verify user has admin role
		if (user.role !== 'admin') {
			await auditLogService.warn(
				'Admin login failed - not an admin',
				'admin-controller',
				{
					email,
					userId: user.user_id,
					role: user.role,
					ip: req.ip,
					timestamp: new Date(),
				}
			);
			return res.status(403).json({ error: 'Access denied' });
		}

		// Create a token with admin privileges
		const tokenPayload = {
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role,
		};

		const token = jwt.sign(
			tokenPayload,
			process.env.JWT_SECRET ?? 'default_jwt_secret',
			{ expiresIn: '8h' }
		);

		// Update last login time
		user.last_login = new Date();
		await user.save();

		// Audit log - successful admin login
		await auditLogService.info('Admin login successful', 'admin-controller', {
			userId: user.user_id,
			email,
			timestamp: new Date(),
		});

		// Return user data and token
		return res.status(200).json({
			user: {
				id: user.user_id,
				email: user.email,
				name: user.username,
				role: user.role,
			},
			token,
		});
	} catch (error) {
		// Audit log - failed login
		await auditLogService.warn('Admin login error', 'admin-controller', {
			email,
			error: error instanceof Error ? error.message : 'Unknown error',
			ip: req.ip,
			timestamp: new Date(),
		});

		console.error('Admin login error:', error);
		res.status(500).json({ error: 'An error occurred during login' });
	}
};

/**
 * Validate an admin token
 */
export const validateAdminToken = (req: Request, res: Response) => {
	try {
		// If we got here, the token is valid (checked by authenticateToken middleware)
		// and the user is an admin (checked by adminOnlyMiddleware)

		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		return res.status(200).json({
			id: req.user.user_id,
			email: req.user.email,
			name: req.user.username,
			role: req.user.role,
		});
	} catch (error) {
		console.error('Token validation error:', error);
		res.status(401).json({ error: 'Invalid token' });
	}
};

/**
 * Get all content items with filtering and pagination
 */
export const getAllContent = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 10;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const search = req.query.search as string;
		const type = req.query.type as 'movie' | 'show' | 'episode';
		const status = req.query.status as string;
		const sortBy = req.query.sortBy as string;
		const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

		// Build query conditions
		const where: Record<string, unknown> = {};
		if (search) {
			where.title = { [Op.iLike]: `%${search}%` };
		}
		if (type) {
			where.type = type;
		}
		if (status) {
			where.status = status;
		}

		// Determine sort order
		const order: [string, string][] = [];
		if (sortBy) {
			order.push([sortBy, sortOrder.toUpperCase()]);
		} else {
			order.push(['reported_count', 'DESC']);
		}

		const content = await Content.findAll({
			where,
			order,
			limit,
			offset,
			attributes: [
				'id',
				'title',
				'type',
				'status',
				'reported_count',
				'created_at',
				'updated_at', // Fixed: changed from last_updated to updated_at
			],
		});

		// Get total count for pagination
		const totalCount = await Content.count({ where });

		// Audit log
		await auditLogService.info('Retrieved all content', 'admin-controller', {
			adminId: req.user?.user_id,
			filters: {
				search,
				type,
				status,
				sortBy,
				sortOrder,
			},
			pagination: { limit, offset },
		});

		return res.status(200).json({
			content,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + content.length < totalCount,
			},
		});
	} catch (error) {
		console.error('Error fetching content:', error);
		await auditLogService.error('Failed to fetch content', 'admin-controller', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		return res.status(500).json({ error: 'Failed to fetch content' });
	}
};

/**
 * Get reports for a specific content item
 */
export const getContentReports = async (req: Request, res: Response) => {
	try {
		const { contentId } = req.params;
		const reports = await ContentReport.findAll({
			where: { content_id: contentId },
			include: [
				{
					model: User,
					attributes: ['username'],
					as: 'user',
				},
			],
			order: [['created_at', 'DESC']],
		});

		return res.status(200).json({ reports });
	} catch (error) {
		console.error('Error fetching content reports:', error);
		return res.status(500).json({ error: 'Failed to fetch reports' });
	}
};

/**
 * Update content details
 */
export const updateContent = async (req: Request, res: Response) => {
	try {
		const { contentId } = req.params;
		const requestData = req.body as Record<string, unknown>;
		const title = requestData.title as string | undefined;
		const status = requestData.status as string | undefined;

		const content = await Content.findByPk(contentId);
		if (!content) {
			return res.status(404).json({ error: 'Content not found' });
		}

		// Store original values for audit log
		const originalValues = {
			title: content.title,
			status: content.status,
		};

		// Update content
		if (title) content.title = title;
		if (status)
			content.status = status as 'active' | 'pending' | 'flagged' | 'removed';
		await content.save();

		// Audit log
		await auditLogService.warn('Updated content', 'admin-controller', {
			adminId: req.user?.user_id,
			contentId,
			changes: {
				title: { from: originalValues.title, to: content.title },
				status: { from: originalValues.status, to: content.status },
			},
		});

		return res.status(200).json({
			success: true,
			message: 'Content updated successfully',
			content,
		});
	} catch (error) {
		console.error('Error updating content:', error);
		return res.status(500).json({ error: 'Failed to update content' });
	}
};

/**
 * Flag content for review
 */
export const flagContent = async (req: Request, res: Response) => {
	try {
		const { contentId } = req.params;

		const content = await Content.findByPk(contentId);
		if (!content) {
			return res.status(404).json({ error: 'Content not found' });
		}

		content.status = 'flagged';
		await content.save();

		// Audit log
		await auditLogService.warn(
			'Flagged content for review',
			'admin-controller',
			{
				adminId: req.user?.user_id,
				contentId,
			}
		);

		return res.status(200).json({
			success: true,
			message: 'Content flagged for review',
		});
	} catch (error) {
		console.error('Error flagging content:', error);
		return res.status(500).json({ error: 'Failed to flag content' });
	}
};

/**
 * Approve content
 */
export const approveContent = async (req: Request, res: Response) => {
	try {
		const { contentId } = req.params;

		const content = await Content.findByPk(contentId);
		if (!content) {
			return res.status(404).json({ error: 'Content not found' });
		}

		content.status = 'active';
		await content.save();

		// Audit log
		await auditLogService.info('Approved content', 'admin-controller', {
			adminId: req.user?.user_id,
			contentId,
		});

		return res.status(200).json({
			success: true,
			message: 'Content approved successfully',
		});
	} catch (error) {
		console.error('Error approving content:', error);
		return res.status(500).json({ error: 'Failed to approve content' });
	}
};

/**
 * Remove content
 */
export const removeContent = async (req: Request, res: Response) => {
	try {
		const { contentId } = req.params;
		const requestData = req.body as Record<string, unknown>;
		const reason = requestData.reason as string;

		const content = await Content.findByPk(contentId);
		if (!content) {
			return res.status(404).json({ error: 'Content not found' });
		}

		content.status = 'removed';
		content.removal_reason = reason;
		await content.save();

		// Audit log
		await auditLogService.warn('Removed content', 'admin-controller', {
			adminId: req.user?.user_id,
			contentId,
			reason,
		});

		return res.status(200).json({
			success: true,
			message: 'Content removed successfully',
		});
	} catch (error) {
		console.error('Error removing content:', error);
		return res.status(500).json({ error: 'Failed to remove content' });
	}
};

/**
 * Dismiss a content report
 */
export const dismissReport = async (req: Request, res: Response) => {
	try {
		const { reportId } = req.params;

		const report = await ContentReport.findByPk(reportId);
		if (!report) {
			return res.status(404).json({ error: 'Report not found' });
		}

		// Mark report as dismissed
		report.status = 'dismissed';
		await report.save();

		// Update reported_count on the content
		const content = await Content.findByPk(report.content_id);
		if (content && content.reported_count > 0) {
			content.reported_count -= 1;
			await content.save();
		}

		// Audit log
		await auditLogService.info('Dismissed content report', 'admin-controller', {
			adminId: req.user?.user_id,
			reportId,
			contentId: report.content_id,
		});

		return res.status(200).json({
			success: true,
			message: 'Report dismissed successfully',
		});
	} catch (error) {
		console.error('Error dismissing report:', error);
		return res.status(500).json({ error: 'Failed to dismiss report' });
	}
};

// Export controller functions with an object for backward compatibility
export const adminController = {
	getAuditLogs,
	getAuditLogsByLevel,
	getLogSources,
	getAuditLogStats,
	runLogRotation,
	createTestLog,
	// User management functions
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
	changeUserStatus,
	resetUserPassword,
	createUser,
	exportUsersAsCsv,
	getAllWatchlistEntries,
	moderateWatchlistEntry,
	getAllMatches,
	getSystemMetrics,
	getUserActivityStats,
	getDashboardStats,
	getSystemStats,
	getAllActivities,
	getActivityAnalytics,
	getActivitiesByContext,
	getUserActivityPatterns,
	// App settings methods
	getAppSettings, // Explicitly assign the function
	updateAppSettings, // Explicitly assign the function
	clearCache, // Explicitly assign the function
	adminLogin,
	validateAdminToken,
	// Content management functions
	getAllContent,
	getContentReports,
	updateContent,
	flagContent,
	approveContent,
	removeContent,
	dismissReport,
};
