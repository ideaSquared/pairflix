import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auditLogService } from '../services/audit.service';

declare global {
	namespace Express {
		interface Request {
			user?: {
				user_id: string;
				email: string;
				username: string;
				role: string;
				status: string;
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

export const authenticateToken = async (
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
		const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
			username: string;
			role: string;
			status: string;
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
			auditLogService.warn(
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
			return res.status(403).json({ error: 'Invalid or expired token' });
		}

		// Check if user is suspended or banned
		if (currentUser.status === 'suspended') {
			auditLogService.warn(
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
			return res.status(403).json({
				error:
					'Your account has been suspended. Please contact support for assistance.',
			});
		}

		if (currentUser.status === 'banned') {
			auditLogService.warn('Access attempt by banned user', 'auth-middleware', {
				userId: decodedUser.user_id,
				email: decodedUser.email,
				path: req.path,
				method: req.method,
				ip: req.ip,
				timestamp: new Date(),
			});
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
			preferences: currentUser.preferences,
		};

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
