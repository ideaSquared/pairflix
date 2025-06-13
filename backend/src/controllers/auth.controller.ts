import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import EmailVerification from '../models/EmailVerification';
import User from '../models/User';
import { activityService, ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import { authenticateUser } from '../services/auth.service';
import { emailService } from '../services/email.service';
import type { AuthenticatedRequest } from '../types';

/**
 * Safe email validation function that prevents ReDoS attacks
 * Uses simple string operations instead of complex regex
 */
const isValidEmail = (email: string): boolean => {
	// Basic length and character checks
	if (!email || email.length < 5 || email.length > 254) {
		return false;
	}

	// Must contain exactly one @ symbol
	const atIndex = email.indexOf('@');
	const lastAtIndex = email.lastIndexOf('@');
	if (atIndex === -1 || atIndex !== lastAtIndex) {
		return false;
	}

	// Split into local and domain parts
	const localPart = email.substring(0, atIndex);
	const domainPart = email.substring(atIndex + 1);

	// Basic local part validation
	if (localPart.length < 1 || localPart.length > 64) {
		return false;
	}

	// Basic domain part validation
	if (domainPart.length < 1 || domainPart.length > 253) {
		return false;
	}

	// Domain must contain at least one dot
	if (domainPart.indexOf('.') === -1) {
		return false;
	}

	// Check for invalid characters (basic set)
	const invalidChars = /[\s<>()[\]\\,;:]/;
	if (invalidChars.test(email)) {
		return false;
	}

	// Domain should not start or end with dot or hyphen
	if (
		domainPart.startsWith('.') ||
		domainPart.endsWith('.') ||
		domainPart.startsWith('-') ||
		domainPart.endsWith('-')
	) {
		return false;
	}

	return true;
};

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

		// Validate email format using safe validation
		if (!isValidEmail(email)) {
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

		// Create the user with email_verified: false
		const newUser = await User.create({
			email,
			username,
			password_hash,
			role: 'user',
			status: 'pending',
			email_verified: false,
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		});

		// Generate email verification token
		const verificationToken = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Save verification token to database
		await EmailVerification.create({
			user_id: newUser.user_id,
			token: verificationToken,
			expires_at: expiresAt,
		});

		// Generate verification URL
		const verificationUrl = `${process.env.APP_CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

		// Send verification email
		try {
			const emailHtml = emailService.generateEmailVerificationEmail(
				verificationUrl,
				newUser.username
			);
			await emailService.sendEmail({
				to: newUser.email,
				subject: 'Verify Your Email - PairFlix',
				html: emailHtml,
				text: `Hello ${newUser.username}, Please verify your email address by visiting: ${verificationUrl}`,
			});
		} catch (emailError) {
			await auditLogService.warn(
				'Failed to send verification email',
				'auth-controller',
				{
					userId: newUser.user_id,
					email: newUser.email,
					emailError,
				}
			);
		}

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
			message:
				'Account created successfully. Please check your email to verify your account before logging in.',
			email: newUser.email, // Include email so frontend can show which email to check
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
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		// Authenticate user and create session
		const token = await authenticateUser(email, password, req);

		// Decode token to get user_id for activity logging
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			user_id: string;
			email: string;
			username: string;
		};

		// Log the successful login activity
		await activityService.logActivity(
			decoded.user_id,
			ActivityType.USER_LOGIN,
			{
				loginMethod: 'password',
				ipAddress: req.ip || 'unknown',
				userAgent: req.get('User-Agent') || 'unknown',
			}
		);

		res.status(200).json({
			token,
			message: 'Login successful',
		});
	} catch (error) {
		console.error('Login error:', error);

		// For failed logins, we can't get user_id, so just log the attempt without user context
		// The actual failed attempt tracking is handled in auth.service

		if (error instanceof Error) {
			return res.status(401).json({ error: error.message });
		}
		return res.status(401).json({ error: 'Authentication failed' });
	}
};

export const getCurrentUser = async (
	req: AuthenticatedRequest,
	res: Response
) => {
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

export const logout = async (req: AuthenticatedRequest, res: Response) => {
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
