import type AuditLog from '../models/AuditLog';
import { LogLevel } from '../services/audit.service';

/**
 * Transform audit log data into a more structured format
 */
export interface TransformedAuditLog {
	id: string;
	level: LogLevel;
	levelClass: string;
	message: string;
	source: string;
	timestamp: Date;
	context: Record<string, unknown> | null;
	formattedTimestamp: string;
}

/**
 * Transform an audit log entry into a structured format for display
 */
export function transformAuditLog(log: AuditLog): TransformedAuditLog {
	// Safely access properties without destructuring to avoid any type issues
	const { log_id } = log;
	const { level } = log;
	const { message } = log;
	const { source } = log;
	const { created_at } = log;

	// Safely handle context which may be any type from the database
	const context: Record<string, unknown> | null = log.context
		? (log.context as Record<string, unknown>)
		: null;

	// Determine CSS class based on level for UI styling
	let levelClass = '';
	const logLevel = level as LogLevel;
	switch (logLevel) {
		case LogLevel.ERROR:
			levelClass = 'error';
			break;
		case LogLevel.WARN:
			levelClass = 'warning';
			break;
		case LogLevel.INFO:
			levelClass = 'info';
			break;
		case LogLevel.DEBUG:
			levelClass = 'debug';
			break;
		default:
			levelClass = 'default';
	}

	// Format the timestamp in a readable format
	const formattedTimestamp = new Date(created_at).toLocaleString();

	return {
		id: log_id,
		level: logLevel,
		levelClass,
		message,
		source,
		timestamp: created_at,
		context,
		formattedTimestamp,
	};
}
