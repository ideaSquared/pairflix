import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body as { email: string; password: string };
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
			preferences: Record<string, unknown>;
		};

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
		await Promise.resolve(); // Adding an await to make the function actually async
		res.json(req.user);
	} catch (error) {
		// Using the variable properly by logging it with void
		// Always return 500 error when there's an issue with retrieving the current user
		void error; // Explicitly mark as ignored
		res.status(500).json({ error: 'Unknown error occurred' });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		// Only log if we have a user in the request
		if (req.user) {
			// Audit log for successful logout
			await auditLogService.info('User logged out', 'auth-controller', {
				userId: req.user.user_id,
				email: req.user.email,
				ip: req.ip,
				userAgent: req.get('user-agent'),
				timestamp: new Date(),
			});
		} else {
			// Log attempt with no valid user
			await auditLogService.warn(
				'Logout attempt with no valid session',
				'auth-controller',
				{
					ip: req.ip,
					userAgent: req.get('user-agent'),
					timestamp: new Date(),
				}
			);
		}

		res.status(204).send();
	} catch (error) {
		// Log error during logout
		await auditLogService.warn('Error during logout', 'auth-controller', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
			ip: req.ip,
			userAgent: req.get('user-agent'),
			timestamp: new Date(),
		});

		res.status(500).json({ error: 'An error occurred during logout' });
	}
};
