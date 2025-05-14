import { NextFunction, Request, Response } from 'express';
import { auditLogService } from '../services/audit.service';

/**
 * Error handling middleware that logs errors to the audit log
 * This should be registered after all other middleware and routes
 */
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Get request details for context
	const context = {
		path: req.path,
		method: req.method,
		query: req.query,
		body: req.body,
		userId: req.user?.user_id,
		stack: err.stack,
		timestamp: new Date(),
	};

	// Log to audit log
	auditLogService.error(
		err.message || 'Unknown server error',
		'server-error',
		context
	);

	// Don't include stack traces in production
	const errorResponse =
		process.env.NODE_ENV === 'production'
			? { error: err.message || 'Internal Server Error' }
			: { error: err.message, stack: err.stack };

	// Send error response to client
	res.status(500).json(errorResponse);
};
