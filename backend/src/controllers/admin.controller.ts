import { Request, Response } from 'express';
import { Op } from 'sequelize';
import AuditLog from '../models/AuditLog';
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

// Export controller functions with an object for backward compatibility
export const adminController = {
	getAuditLogs,
	getAuditLogsByLevel,
	getLogSources,
	getAuditLogStats,
	runLogRotation,
	createTestLog,
};
