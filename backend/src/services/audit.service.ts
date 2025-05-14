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

// Export service functions with an object for backward compatibility
export const auditLogService = {
	log,
	info,
	warn,
	error,
	debug,
	getRecentLogs,
	getLogsByLevel,
};
