import { NextFunction, Request, Response } from 'express';
import { auditLogService } from '../services/audit.service';

/**
 * Middleware to log all incoming requests to the audit log
 * This should be registered early in the middleware chain
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Skip logging for certain paths (like health checks)
	if (req.path === '/health' || req.path === '/favicon.ico') {
		return next();
	}

	// Prepare context data
	const context = {
		method: req.method,
		path: req.path,
		query: req.query,
		body: req.body,
		userId: req.user?.user_id,
		ip: req.ip,
		userAgent: req.get('user-agent'),
		timestamp: new Date(),
	};

	// Log the request
	auditLogService.info(
		`API Request: ${req.method} ${req.path}`,
		'api-request',
		context
	);

	// Continue to the next middleware/route handler
	next();
};
