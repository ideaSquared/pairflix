import type { NextFunction, Request, Response } from 'express';
import { auditLogService } from '../services/audit.service';

/**
 * Middleware to log all incoming requests to the audit log
 * This should be registered early in the middleware chain
 */
export const requestLogger = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Skip logging for certain paths (like health checks)
	if (req.path === '/health' || req.path === '/favicon.ico') {
		return next();
	}

	// Prepare context data

	const context: {
		method: string;
		path: string;
		query: unknown;
		body: unknown;
		userId: string | null;
		ip: string | undefined;
		userAgent: string | undefined;
		timestamp: Date;
	} = {
		method: req.method,
		path: req.path,
		query: req.query,
		body: req.body,
		userId: (req.user as { user_id?: string } | undefined)?.user_id ?? null,
		ip: req.ip,
		userAgent: req.get('user-agent'),
		timestamp: new Date(),
	};

	try {
		// Log the request - using await to fix floating promise
		await auditLogService.info(
			`API Request: ${req.method} ${req.path}`,
			'api-request',
			context
		);
		// Continue to the next middleware/route handler
		next();
	} catch (error) {
		// If audit logging fails, still continue with the request
		console.warn('Failed to log request:', error);
		next();
	}
};
