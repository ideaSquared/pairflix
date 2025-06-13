import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import PasswordReset from '../models/PasswordReset';
import User from '../models/User';
import UserSession from '../models/UserSession';
import { auditLogService } from './audit.service';
import { emailService } from './email.service';

// Constants for account lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Define proper types for JWT payload and user data
interface UserForToken {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	email_verified: boolean;
	failed_login_attempts: number;
	preferences: {
		theme?: 'light' | 'dark';
		viewStyle?: 'list' | 'grid';
		emailNotifications?: boolean;
		autoArchiveDays?: number;
		favoriteGenres?: string[];
	};
}

/**
 * Check if account is locked
 */
function isAccountLocked(user: any): boolean {
	if (!user.locked_until) return false;
	return new Date() < user.locked_until;
}

/**
 * Handle failed login attempt
 */
async function handleFailedLogin(user: any, ip: string): Promise<void> {
	user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

	// Lock account if max attempts reached
	if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
		user.locked_until = new Date(Date.now() + LOCKOUT_DURATION);

		// Send security alert email
		try {
			await emailService.sendSecurityAlert(
				user.email,
				user.username,
				'Account Locked',
				`Your account has been locked due to ${MAX_FAILED_ATTEMPTS} failed login attempts from IP: ${ip}. The account will be unlocked automatically in ${LOCKOUT_DURATION / 60000} minutes.`
			);
		} catch (emailError) {
			console.error('Failed to send account lockout email:', emailError);
		}

		// Audit log
		await auditLogService.warn(
			'Account locked due to failed login attempts',
			'auth-service',
			{
				userId: user.user_id,
				email: user.email,
				attempts: user.failed_login_attempts,
				ipAddress: ip,
				lockoutUntil: user.locked_until,
			}
		);
	}

	await user.save();
}

/**
 * Reset failed login attempts on successful login
 */
async function resetFailedAttempts(user: any): Promise<void> {
	if (user.failed_login_attempts > 0 || user.locked_until) {
		user.failed_login_attempts = 0;
		user.set('locked_until', null);
		await user.save();
	}
}

/**
 * Create and store user session
 */
async function createUserSession(
	user: any,
	token: string,
	req?: Request
): Promise<void> {
	const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	// Extract device info
	const userAgent = req?.get('User-Agent') || '';
	const deviceInfo = extractDeviceInfo(userAgent);

	const sessionData: any = {
		user_id: user.user_id,
		token_hash: tokenHash,
		device_info: deviceInfo,
		user_agent: userAgent,
		expires_at: expiresAt,
	};

	if (req?.ip) {
		sessionData.ip_address = req.ip;
	}

	await UserSession.create(sessionData);

	// Clean up expired sessions for this user
	await UserSession.destroy({
		where: {
			user_id: user.user_id,
			expires_at: { [Op.lt]: new Date() },
		},
	});
}

/**
 * Extract device info from user agent
 */
function extractDeviceInfo(userAgent: string): string {
	if (!userAgent) return 'Unknown Device';

	// Simple device detection
	if (userAgent.includes('Mobile')) return 'Mobile Device';
	if (userAgent.includes('iPad')) return 'iPad';
	if (userAgent.includes('iPhone')) return 'iPhone';
	if (userAgent.includes('Android')) return 'Android Device';
	if (userAgent.includes('Windows')) return 'Windows PC';
	if (userAgent.includes('Mac')) return 'Mac';
	if (userAgent.includes('Linux')) return 'Linux PC';

	return 'Desktop Browser';
}

export const authenticateUser = async (
	email: string,
	password: string,
	req?: Request
) => {
	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new Error('Invalid credentials');
	}

	// Check if account is locked
	if (isAccountLocked(user)) {
		const unlockTime = user.locked_until!.toLocaleString();
		throw new Error(
			`Account is locked due to multiple failed login attempts. Please try again after ${unlockTime} or contact support.`
		);
	}

	// Check if user has been forced to reset password
	if (user.status === 'pending') {
		const forcedReset = await PasswordReset.findOne({
			where: {
				user_id: user.user_id,
				forced_by_admin: true,
				used: false,
				expires_at: { [Op.gt]: new Date() },
			},
		});

		if (forcedReset) {
			throw new Error(
				'You must reset your password before logging in. Please check your email for reset instructions.'
			);
		}
	}

	const isPasswordValid = await bcrypt.compare(password, user.password_hash);
	if (!isPasswordValid) {
		// Handle failed login
		await handleFailedLogin(user, req?.ip || 'unknown');
		throw new Error('Invalid credentials');
	}

	// Check user status - prevent login for suspended or banned users
	if (user.status === 'suspended') {
		throw new Error(
			'Your account has been suspended. Please contact support for assistance.'
		);
	}

	if (user.status === 'banned') {
		throw new Error(
			'Your account has been banned for violating our terms of service.'
		);
	}

	if (user.status === 'pending') {
		throw new Error(
			'Your account is pending activation. Please complete account setup or contact support.'
		);
	}

	// Successful login - reset failed attempts
	await resetFailedAttempts(user);

	// Update the last login time
	user.last_login = new Date();

	// Check if save method is available (useful for testing)
	if (typeof user.save === 'function') {
		await user.save();
	} else {
		// In test environment, we might not have the save method
		console.error('Save method not available - in test environment');
	}

	const token = jwt.sign(
		{
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role ?? 'user',
			status: user.status ?? 'active',
			email_verified: user.email_verified ?? false,
			failed_login_attempts: user.failed_login_attempts ?? 0,
			preferences: user.preferences ?? {},
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);

	// Create session record
	if (req) {
		await createUserSession(user, token, req);
	}

	// Send login notification email for security
	try {
		await emailService.sendLoginNotification(
			user.email,
			user.username,
			req?.ip || 'unknown',
			extractDeviceInfo(req?.get('User-Agent') || '')
		);
	} catch (emailError) {
		console.error('Failed to send login notification:', emailError);
	}

	return token;
};

export const generateToken = (user: UserForToken): string =>
	jwt.sign(
		{
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role ?? 'user',
			status: user.status ?? 'active',
			email_verified: user.email_verified ?? false,
			failed_login_attempts: user.failed_login_attempts ?? 0,
			preferences: user.preferences ?? {},
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);

/**
 * Invalidate a specific session
 */
export const invalidateSession = async (
	tokenOrHash: string
): Promise<boolean> => {
	try {
		// Try to find by token hash first
		let tokenHash = tokenOrHash;

		// If it looks like a JWT token, hash it
		if (tokenOrHash.includes('.')) {
			tokenHash = crypto.createHash('sha256').update(tokenOrHash).digest('hex');
		}

		const deleted = await UserSession.destroy({
			where: { token_hash: tokenHash },
		});

		return deleted > 0;
	} catch (error) {
		console.error('Error invalidating session:', error);
		return false;
	}
};

/**
 * Invalidate all sessions for a user
 */
export const invalidateAllUserSessions = async (
	userId: string
): Promise<number> => {
	try {
		const deleted = await UserSession.destroy({
			where: { user_id: userId },
		});

		await auditLogService.info(
			'All user sessions invalidated',
			'auth-service',
			{
				userId,
				sessionsDeleted: deleted,
			}
		);

		return deleted;
	} catch (error) {
		console.error('Error invalidating all user sessions:', error);
		return 0;
	}
};

/**
 * Reset user password using token
 */
export const resetPassword = async (
	token: string,
	newPassword: string
): Promise<void> => {
	const resetRequest = await PasswordReset.findOne({
		where: {
			token,
			used: false,
			expires_at: { [Op.gt]: new Date() },
		},
		include: [
			{
				model: User,
				as: 'user',
			},
		],
	});

	if (!resetRequest) {
		throw new Error('Invalid or expired reset token');
	}

	const user = (resetRequest as any).user;
	const hashedPassword = await bcrypt.hash(newPassword, 12);

	// Update password
	user.password_hash = hashedPassword;

	// If this was a forced reset, restore user status to active
	if (resetRequest.forced_by_admin && user.status === 'pending') {
		user.status = 'active';
	}

	await user.save();

	// Mark reset as used
	resetRequest.used = true;
	await resetRequest.save();

	// Send password changed notification
	try {
		await emailService.sendPasswordChangedNotification(
			user.email,
			user.username,
			resetRequest.forced_by_admin ? 'admin' : 'user'
		);
	} catch (emailError) {
		console.error('Failed to send password change notification:', emailError);
	}

	// Audit log
	await auditLogService.info('Password reset completed', 'auth-service', {
		userId: user.user_id,
		email: user.email,
		forcedByAdmin: resetRequest.forced_by_admin,
		timestamp: new Date(),
	});
};
