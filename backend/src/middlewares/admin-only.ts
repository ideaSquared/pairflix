import type { NextFunction, Response } from 'express';
import { auditLogService } from '../services/audit.service';
import type { AuthenticatedRequest } from '../types';

/**
 * Middleware to restrict access to admin users only
 * Must be called after authentication middleware
 */
export const adminOnlyMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	// Check if user exists and has admin role
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	if (req.user.role !== 'admin') {
		try {
			// Audit log unauthorized admin access attempt
			await auditLogService.warn(
				'Unauthorized admin access attempt',
				'admin-middleware',
				{
					userId: req.user.user_id,
					email: req.user.email,
					path: req.path,
					method: req.method,
					ip: req.ip,
					userAgent: req.get('user-agent'),
					timestamp: new Date(),
				}
			);
		} catch (error) {
			// If audit logging fails, still continue with the rejection
			console.warn('Failed to log admin access attempt:', error);
		}

		return res.status(403).json({ error: 'Admin access required' });
	}

	// User is authenticated and has admin role
	next();
};

// Default export as well for compatibility
export default { adminOnlyMiddleware };
