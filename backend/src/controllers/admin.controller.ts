import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import AuditLog from '../models/AuditLog';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import { auditLogService, LogLevel } from '../services/audit.service';
import { statisticsService } from '../services/statistics.service';

// Import Express namespace to ensure the Request type includes user property
import '../middlewares/auth';

/**
 * Get all recent audit logs
 */
export const getAuditLogs = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 100;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const source = req.query.source as string;
		const startDate = req.query.startDate as string;
		const endDate = req.query.endDate as string;

		// Build query conditions
		const where: any = {};

		// Filter by source if provided
		if (source) {
			where.source = source;
		}

		// Filter by date range if provided
		if (startDate || endDate) {
			where.created_at = {};

			if (startDate) {
				where.created_at[Op.gte] = new Date(startDate);
			}

			if (endDate) {
				where.created_at[Op.lte] = new Date(endDate);
			}
		}

		const logs = await AuditLog.findAll({
			where,
			order: [['created_at', 'DESC']],
			limit,
			offset,
		});

		// Get total count for pagination
		const totalCount = await AuditLog.count({ where });

		return res.status(200).json({
			logs,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + logs.length < totalCount,
			},
		});
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
		const source = req.query.source as string;
		const startDate = req.query.startDate as string;
		const endDate = req.query.endDate as string;

		// Build query conditions
		const where: any = { level };

		// Filter by source if provided
		if (source) {
			where.source = source;
		}

		// Filter by date range if provided
		if (startDate || endDate) {
			where.created_at = {};

			if (startDate) {
				where.created_at[Op.gte] = new Date(startDate);
			}

			if (endDate) {
				where.created_at[Op.lte] = new Date(endDate);
			}
		}

		const logs = await AuditLog.findAll({
			where,
			order: [['created_at', 'DESC']],
			limit,
			offset,
		});

		// Get total count for pagination
		const totalCount = await AuditLog.count({ where });

		return res.status(200).json({
			logs,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + logs.length < totalCount,
			},
		});
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
		const customRetention = req.body.retentionDays;

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
		const { level, message } = req.body;

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
		const where: any = {};

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
			where.status = status;
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
			filters: { search, role, status, sortBy, sortOrder },
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
		const { username, email, role, status } = req.body;

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
		const { status, reason } = req.body;

		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}

		if (
			!status ||
			!['active', 'inactive', 'suspended', 'pending'].includes(status)
		) {
			return res.status(400).json({
				error: 'Valid status is required',
				validStatuses: ['active', 'inactive', 'suspended', 'pending'],
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
		const { username, email, password, role, status } = req.body;

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
			role: role || 'user',
			status: status || 'active',
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
		const where: any = {};

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
		const where: any = {};

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
		const { action, reason } = req.body;

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
				action: req.body.action,
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
		const where: any = {};

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
};
