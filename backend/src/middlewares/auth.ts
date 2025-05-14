import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auditLogService } from '../services/audit.service';

declare global {
	namespace Express {
		interface Request {
			user?: {
				user_id: string;
				email: string;
				username: string;
				role: string;
				preferences: {
					theme: 'light' | 'dark';
					viewStyle: 'list' | 'grid';
					emailNotifications: boolean;
					autoArchiveDays: number;
					favoriteGenres: string[];
				};
			};
		}
	}
}

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		console.log('Auth failed: No token provided');

		// Audit log - missing token
		auditLogService.warn(
			'Authentication failed: No token provided',
			'auth-middleware',
			{
				path: req.path,
				method: req.method,
				ip: req.ip,
				userAgent: req.get('user-agent'),
				timestamp: new Date(),
			}
		);

		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
			username: string;
			role: string;
			preferences: {
				theme: 'light' | 'dark';
				viewStyle: 'list' | 'grid';
				emailNotifications: boolean;
				autoArchiveDays: number;
				favoriteGenres: string[];
			};
		};
		req.user = user;
		next();
	} catch (error) {
		console.error('Auth failed:', error);

		// Audit log - invalid token
		auditLogService.warn(
			'Authentication failed: Invalid or expired token',
			'auth-middleware',
			{
				path: req.path,
				method: req.method,
				error: error instanceof Error ? error.message : 'Unknown error',
				ip: req.ip,
				userAgent: req.get('user-agent'),
				timestamp: new Date(),
			}
		);

		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};

/**
 * Middleware to restrict access to admin users only
 * Must be called after authenticateToken middleware
 */
export const requireAdmin = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Check if user exists and has admin role
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	if (req.user.role !== 'admin') {
		// Audit log unauthorized admin access attempt
		auditLogService.warn(
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

		return res.status(403).json({ error: 'Admin access required' });
	}

	// User is authenticated and has admin role
	next();
};
