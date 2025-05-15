import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../db/connection';
import ActivityLog from '../models/ActivityLog';
import AuditLog from '../models/AuditLog';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import { auditLogService, LogLevel } from '../services/audit.service';

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
					attributes: ['title', 'media_type', 'media_id'],
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
		// Get counts from various tables
		const userCount = await User.count();
		const activeUserCount = await User.count({
			where: {
				last_login: {
					[Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)),
				},
			},
		});
		const watchlistCount = await WatchlistEntry.count();
		const matchCount = await Match.count();

		// Get activity stats
		const last24HoursActivity = await ActivityLog.count({
			where: {
				created_at: {
					[Op.gte]: new Date(new Date().setDate(new Date().getDate() - 1)),
				},
			},
		});

		const lastWeekActivity = await ActivityLog.count({
			where: {
				created_at: {
					[Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)),
				},
			},
		});

		// Get errors from audit logs
		const recentErrors = await AuditLog.count({
			where: {
				level: 'error',
				created_at: {
					[Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)),
				},
			},
		});

		return res.status(200).json({
			metrics: {
				users: {
					total: userCount,
					active: activeUserCount,
					inactivePercentage:
						userCount > 0
							? ((userCount - activeUserCount) / userCount) * 100
							: 0,
				},
				content: {
					watchlistEntries: watchlistCount,
					matches: matchCount,
				},
				activity: {
					last24Hours: last24HoursActivity,
					lastWeek: lastWeekActivity,
				},
				system: {
					recentErrors,
					uptime: process.uptime(), // Server uptime in seconds
					memoryUsage: process.memoryUsage(),
					timestamp: new Date(),
				},
			},
		});
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

		// Get date for filtering
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		// Common where clause for filtering by date
		const dateFilter = {
			created_at: { [Op.gte]: startDate },
		};

		// Get activity counts by date
		const activityByDate = await ActivityLog.findAll({
			attributes: [
				[sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
				[sequelize.fn('COUNT', sequelize.col('*')), 'count'],
			],
			where: dateFilter,
			group: [sequelize.fn('DATE', sequelize.col('created_at'))],
			order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
		});

		// Get activity counts by type
		const activityByType = await ActivityLog.findAll({
			attributes: [
				'action',
				[sequelize.fn('COUNT', sequelize.col('*')), 'count'],
			],
			where: dateFilter,
			group: ['action'],
			order: [[sequelize.fn('COUNT', sequelize.col('*')), 'DESC']],
		});

		// Get most active users - only include records where user_id exists
		const mostActiveUsers = await ActivityLog.findAll({
			attributes: [
				'user_id',
				[sequelize.fn('COUNT', sequelize.col('*')), 'count'],
			],
			where: {
				...dateFilter,
				user_id: {
					[Op.ne]: '', // Filter for non-empty strings instead of using Op.not: null
				},
			},
			group: ['user_id'],
			order: [[sequelize.fn('COUNT', sequelize.col('*')), 'DESC']],
			limit: 10,
			include: [{ model: User, attributes: ['username', 'email'] }],
		});

		return res.status(200).json({
			timespan: { days, startDate },
			activityByDate,
			activityByType,
			mostActiveUsers,
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
	// Content management functions
	getAllWatchlistEntries,
	moderateWatchlistEntry,
	getAllMatches,
	// System functions
	getSystemMetrics,
	getUserActivityStats,
};
