import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	try {
		// Audit log - login attempt
		await auditLogService.info('Login attempt', 'auth-controller', {
			email,
			ip: req.ip,
			userAgent: req.get('user-agent'),
			timestamp: new Date(),
		});

		const token = await authenticateUser(email, password);

		// Decode token to get user_id for activity logging
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			user_id: string;
			email: string;
			username: string;
			preferences: any;
		};

		// Log the login activity - this isn't typically shown to other users
		// and should be moved to audit logging only
		// await activityService.logActivity(
		//	decoded.user_id,
		//	ActivityType.USER_LOGIN,
		//	{ timestamp: new Date() }
		// );

		// Audit log - successful login
		await auditLogService.info('Login successful', 'auth-controller', {
			userId: decoded.user_id,
			email,
			timestamp: new Date(),
		});

		res.json({ token });
	} catch (error) {
		// Audit log - failed login
		await auditLogService.warn('Login failed', 'auth-controller', {
			email,
			error: error instanceof Error ? error.message : 'Unknown error',
			ip: req.ip,
			timestamp: new Date(),
		});

		if (error instanceof Error) {
			res.status(401).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		// req.user is set by the authenticateToken middleware
		if (!req.user) {
			return res.status(500).json({ error: 'Unknown error occurred' });
		}
		res.json(req.user);
	} catch (error) {
		// Always return 500 error when there's an issue with retrieving the current user
		res.status(500).json({ error: 'Unknown error occurred' });
	}
};
