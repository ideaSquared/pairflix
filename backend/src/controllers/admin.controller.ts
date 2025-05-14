import { Request, Response } from 'express';
import { auditLogService, LogLevel } from '../services/audit.service';

/**
 * Get all recent audit logs
 */
export const getAuditLogs = async (req: Request, res: Response) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 100;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		const logs = await auditLogService.getRecentLogs(limit, offset);

		return res.status(200).json({ logs });
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

		const logs = await auditLogService.getLogsByLevel(
			level as LogLevel,
			limit,
			offset
		);

		return res.status(200).json({ logs });
	} catch (error) {
		console.error('Error fetching audit logs by level:', error);
		return res.status(500).json({ error: 'Failed to fetch audit logs' });
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

// Export controller functions with an object for backward compatibility
export const adminController = {
	getAuditLogs,
	getAuditLogsByLevel,
	createTestLog,
};
