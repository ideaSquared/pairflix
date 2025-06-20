import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auditLogService } from '../services/audit.service';

// Using interface instead of namespace for better TS practices
export interface AuthenticatedRequest extends Request {
	user?: {
		user_id: string;
		email: string;
		username: string;
		role: string;
		status: string;
		email_verified: boolean;
		failed_login_attempts: number;
		preferences: {
			theme: 'light' | 'dark';
			viewStyle: 'list' | 'grid';
			emailNotifications: boolean;
			autoArchiveDays: number;
			favoriteGenres: string[];
		};
	};
}

// Augment Express Request interface to include user property
declare module 'express-serve-static-core' {
	interface Request {
		user?: {
			user_id: string;
			email: string;
			username: string;
			role: string;
			status: string;
			email_verified: boolean;
			failed_login_attempts: number;
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

export const authenticateToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(' ')[1];

	if (!token) {
		console.warn('Auth failed: No token provided');

		try {
			// Audit log - missing token
			await auditLogService.warn(
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
		} catch (error) {
			console.warn('Failed to log missing token:', error);
		}

		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
			username: string;
			role: string;
			status: string;
			email_verified: boolean;
			failed_login_attempts: number;
			preferences: {
				theme: 'light' | 'dark';
				viewStyle: 'list' | 'grid';
				emailNotifications: boolean;
				autoArchiveDays: number;
				favoriteGenres: string[];
			};
		};

		// Get the latest user data from database to check current status
		const currentUser = await User.findByPk(decodedUser.user_id);

		// If user no longer exists in DB
		if (!currentUser) {
			try {
				await auditLogService.warn(
					'Authentication failed: User no longer exists',
					'auth-middleware',
					{
						userId: decodedUser.user_id,
						path: req.path,
						method: req.method,
						ip: req.ip,
						timestamp: new Date(),
					}
				);
			} catch (error) {
				console.warn('Failed to log user not found:', error);
			}
			return res.status(403).json({ error: 'Invalid or expired token' });
		}

		// Check if user is suspended or banned
		if (currentUser.status === 'suspended') {
			try {
				await auditLogService.warn(
					'Access attempt by suspended user',
					'auth-middleware',
					{
						userId: decodedUser.user_id,
						email: decodedUser.email,
						path: req.path,
						method: req.method,
						ip: req.ip,
						timestamp: new Date(),
					}
				);
			} catch (error) {
				console.warn('Failed to log suspended user access:', error);
			}
			return res.status(403).json({
				error:
					'Your account has been suspended. Please contact support for assistance.',
			});
		}

		if (currentUser.status === 'banned') {
			try {
				await auditLogService.warn(
					'Access attempt by banned user',
					'auth-middleware',
					{
						userId: decodedUser.user_id,
						email: decodedUser.email,
						path: req.path,
						method: req.method,
						ip: req.ip,
						timestamp: new Date(),
					}
				);
			} catch (error) {
				console.warn('Failed to log banned user access:', error);
			}
			return res.status(403).json({
				error:
					'Your account has been banned for violating our terms of service.',
			});
		}

		// Use current user data to ensure we have the most up-to-date information
		req.user = {
			user_id: currentUser.user_id,
			email: currentUser.email,
			username: currentUser.username,
			role: currentUser.role,
			status: currentUser.status,
			email_verified: currentUser.email_verified,
			failed_login_attempts: currentUser.failed_login_attempts,
			preferences: currentUser.preferences,
		};

		next();
	} catch (error) {
		console.error('Auth failed:', error);

		try {
			// Audit log - invalid token
			await auditLogService.warn(
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
		} catch (logError) {
			console.warn('Failed to log invalid token:', logError);
		}

		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};

/**
 * Middleware to restrict access to admin users only
 * Must be called after authenticateToken middleware
 */
export const requireAdmin = async (
	req: Request,
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
			console.warn('Failed to log unauthorized admin access:', error);
		}

		return res.status(403).json({ error: 'Admin access required' });
	}

	// User is authenticated and has admin role
	next();
};
