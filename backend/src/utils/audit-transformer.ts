import AuditLog from '../models/AuditLog';
import { LogLevel } from '../services/audit.service';

/**
 * Transform audit log data into a more structured format
 */
export interface TransformedAuditLog {
	id: string;
	level: string;
	levelClass: string;
	message: string;
	source: string;
	timestamp: Date;
	context: any;
	formattedTimestamp: string;
}

/**
 * Transform an audit log entry into a structured format for display
 */
export function transformAuditLog(log: AuditLog): TransformedAuditLog {
	const { log_id, level, message, source, context, created_at } = log;

	// Determine CSS class based on level for UI styling
	let levelClass = '';
	switch (level) {
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
		level,
		levelClass,
		message,
		source,
		timestamp: created_at,
		context,
		formattedTimestamp,
	};
}
