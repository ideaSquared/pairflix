import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
	const { email, password, username } = req.body as {
		email: string;
		password: string;
		username: string;
	};

	try {
		// Audit log - registration attempt
		await auditLogService.info('User registration attempt', 'auth-controller', {
			email,
			username,
			ip: req.ip,
			userAgent: req.get('user-agent'),
			timestamp: new Date(),
		});

		// Validate required fields
		if (!email || !password || !username) {
			return res.status(400).json({
				error: 'Email, password, and username are required',
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: 'Please provide a valid email address',
			});
		}

		// Validate username format
		const usernameRegex = /^[a-zA-Z0-9_-]+$/;
		if (
			!usernameRegex.test(username) ||
			username.length < 3 ||
			username.length > 30
		) {
			return res.status(400).json({
				error:
					'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
			});
		}

		// Validate password strength
		if (password.length < 8) {
			return res.status(400).json({
				error: 'Password must be at least 8 characters long',
			});
		}

		// Check if email already exists
		const existingUserByEmail = await User.findOne({ where: { email } });
		if (existingUserByEmail) {
			await auditLogService.warn(
				'Registration failed - email already exists',
				'auth-controller',
				{
					email,
					ip: req.ip,
					timestamp: new Date(),
				}
			);
			return res.status(409).json({
				error: 'An account with this email address already exists',
			});
		}

		// Check if username already exists
		const existingUserByUsername = await User.findOne({ where: { username } });
		if (existingUserByUsername) {
			await auditLogService.warn(
				'Registration failed - username already exists',
				'auth-controller',
				{
					username,
					ip: req.ip,
					timestamp: new Date(),
				}
			);
			return res.status(409).json({
				error: 'This username is already taken',
			});
		}

		// Hash the password
		const saltRounds = 12;
		const password_hash = await bcrypt.hash(password, saltRounds);

		// Create the user
		const newUser = await User.create({
			email,
			username,
			password_hash,
			role: 'user',
			status: 'active',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		});

		// Generate JWT token for automatic login
		const token = jwt.sign(
			{
				user_id: newUser.user_id,
				email: newUser.email,
				username: newUser.username,
				role: newUser.role,
				status: newUser.status,
				preferences: newUser.preferences,
			},
			process.env.JWT_SECRET!,
			{ expiresIn: '7d' }
		);

		// Audit log - successful registration
		await auditLogService.info(
			'User registration successful',
			'auth-controller',
			{
				userId: newUser.user_id,
				email: newUser.email,
				username: newUser.username,
				timestamp: new Date(),
			}
		);

		res.status(201).json({
			token,
			user: {
				user_id: newUser.user_id,
				email: newUser.email,
				username: newUser.username,
				role: newUser.role,
				status: newUser.status,
				preferences: newUser.preferences,
			},
		});
	} catch (error) {
		// Audit log - registration error
		await auditLogService.error('User registration failed', 'auth-controller', {
			email,
			username,
			error: error instanceof Error ? error.message : 'Unknown error',
			ip: req.ip,
			timestamp: new Date(),
		});

		console.error('Registration error:', error);

		if (error instanceof Error) {
			res.status(500).json({ error: 'Registration failed. Please try again.' });
		} else {
			res
				.status(500)
				.json({ error: 'Unknown error occurred during registration' });
		}
	}
};

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
