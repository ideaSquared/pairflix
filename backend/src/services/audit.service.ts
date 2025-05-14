import { Op } from 'sequelize';
import AuditLog from '../models/AuditLog';

/**
 * Log levels for audit logging
 */
export enum LogLevel {
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	DEBUG = 'debug',
}

// Default retention periods in days for different log levels
export const DEFAULT_RETENTION_PERIODS = {
	[LogLevel.INFO]: 30, // Keep info logs for 30 days
	[LogLevel.DEBUG]: 7, // Keep debug logs for 7 days
	[LogLevel.WARN]: 90, // Keep warnings for 90 days
	[LogLevel.ERROR]: 365, // Keep errors for 1 year
};

/**
 * Log a system event or error
 * @param level - Severity level of the log
 * @param message - Short description of what happened
 * @param source - Component or area where the event occurred
 * @param context - Additional data about the event (optional)
 * @returns The created audit log entry or null if creation fails
 */
export const log = async (
	level: LogLevel,
	message: string,
	source: string,
	context?: any
): Promise<AuditLog | null> => {
	try {
		// Ensure context is never undefined - convert to empty object if needed
		const safeContext = context || {};

		return await AuditLog.create({
			level,
			message,
			source,
			context: safeContext,
		});
	} catch (error) {
		// Don't throw errors from audit logging
		console.error('Failed to create audit log:', error);
		return null;
	}
};

/**
 * Log an informational event
 */
export const info = async (
	message: string,
	source: string,
	context?: any
): Promise<AuditLog | null> => {
	return log(LogLevel.INFO, message, source, context);
};

/**
 * Log a warning
 */
export const warn = async (
	message: string,
	source: string,
	context?: any
): Promise<AuditLog | null> => {
	return log(LogLevel.WARN, message, source, context);
};

/**
 * Log an error
 */
export const error = async (
	message: string,
	source: string,
	context?: any
): Promise<AuditLog | null> => {
	return log(LogLevel.ERROR, message, source, context);
};

/**
 * Log debug information (only for development)
 */
export const debug = async (
	message: string,
	source: string,
	context?: any
): Promise<AuditLog | null> => {
	// Only log debug messages if not in production
	if (process.env.NODE_ENV !== 'production') {
		return log(LogLevel.DEBUG, message, source, context);
	}
	return null;
};

/**
 * Get recent audit logs
 * @param limit - Maximum number of logs to return
 * @param offset - Number of logs to skip (for pagination)
 * @returns Array of audit log entries
 */
export const getRecentLogs = async (
	limit = 100,
	offset = 0
): Promise<AuditLog[]> => {
	return AuditLog.findAll({
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});
};

/**
 * Get audit logs filtered by level
 * @param level - Log level to filter by
 * @param limit - Maximum number of logs to return
 * @param offset - Number of logs to skip (for pagination)
 * @returns Array of filtered audit log entries
 */
export const getLogsByLevel = async (
	level: LogLevel,
	limit = 100,
	offset = 0
): Promise<AuditLog[]> => {
	return AuditLog.findAll({
		where: { level },
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});
};

/**
 * Clean up logs older than the specified retention period
 * @param retentionDays - Number of days to keep logs (default: use DEFAULT_RETENTION_PERIODS)
 * @returns Number of logs deleted
 */
export const cleanupOldLogs = async (retentionDays?: {
	[key in LogLevel]?: number;
}): Promise<number> => {
	try {
		const retention = {
			...DEFAULT_RETENTION_PERIODS,
			...(retentionDays || {}),
		};

		let totalDeleted = 0;

		// Process each log level separately
		for (const level of Object.values(LogLevel)) {
			const daysToKeep = retention[level];
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

			const count = await AuditLog.destroy({
				where: {
					level,
					created_at: {
						[Op.lt]: cutoffDate,
					},
				},
			});

			totalDeleted += count;

			// Log the cleanup operation itself
			await log(
				LogLevel.INFO,
				`Cleaned up ${count} ${level} logs older than ${daysToKeep} days`,
				'audit-log-rotation'
			);
		}

		return totalDeleted;
	} catch (error) {
		console.error('Failed to clean up old logs:', error);
		return 0;
	}
};

/**
 * Get statistics about audit logs in the system
 * @returns Object with log count by level and total count
 */
export const getAuditLogStats = async (): Promise<{
	total: number;
	byLevel: { [key in LogLevel]?: number };
	oldestLog: Date | null;
	newestLog: Date | null;
}> => {
	const stats = {
		total: 0,
		byLevel: {} as { [key in LogLevel]?: number },
		oldestLog: null as Date | null,
		newestLog: null as Date | null,
	};

	// Get total count
	stats.total = await AuditLog.count();

	// Get count by level
	for (const level of Object.values(LogLevel)) {
		stats.byLevel[level] = await AuditLog.count({
			where: { level },
		});
	}

	// Get oldest log date
	const oldest = await AuditLog.findOne({
		order: [['created_at', 'ASC']],
		attributes: ['created_at'],
	});
	stats.oldestLog = oldest ? oldest.created_at : null;

	// Get newest log date
	const newest = await AuditLog.findOne({
		order: [['created_at', 'DESC']],
		attributes: ['created_at'],
	});
	stats.newestLog = newest ? newest.created_at : null;

	return stats;
};

// Export service functions with an object for backward compatibility
export const auditLogService = {
	log,
	info,
	warn,
	error,
	debug,
	getRecentLogs,
	getLogsByLevel,
	cleanupOldLogs,
	getAuditLogStats,
};
