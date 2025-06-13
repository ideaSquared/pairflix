import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import EmailVerification from '../models/EmailVerification';
import PasswordReset from '../models/PasswordReset';
import User from '../models/User';
import { auditLogService } from '../services/audit.service';
import { emailService } from '../services/email.service';
import type { AuthenticatedRequest } from '../types';

/**
 * Request password reset
 */
export const forgotPassword = async (req: Request, res: Response) => {
	const { email } = req.body as { email: string };

	try {
		await auditLogService.info('Password reset request', 'email-controller', {
			email,
			ip: req.ip,
			userAgent: req.get('user-agent'),
		});

		if (!email) {
			return res.status(400).json({
				error: 'Email is required',
			});
		}

		// Find user by email
		const user = await User.findOne({ where: { email } });
		if (!user) {
			// Don't reveal whether email exists or not for security
			return res.status(200).json({
				message:
					'If an account with that email exists, you will receive a password reset link.',
			});
		}

		// Generate secure reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		// Save reset token to database
		await PasswordReset.create({
			user_id: user.user_id,
			token: resetToken,
			expires_at: expiresAt,
		});

		// Generate reset URL
		const resetUrl = `${process.env.APP_CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

		// Send email
		const emailHtml = emailService.generatePasswordResetEmail(
			resetUrl,
			user.username
		);
		await emailService.sendEmail({
			to: user.email,
			subject: 'Reset Your Password - PairFlix',
			html: emailHtml,
			text: `Hello ${user.username}, You requested a password reset. Visit this link to reset your password: ${resetUrl}`,
		});

		await auditLogService.info(
			'Password reset email sent',
			'email-controller',
			{
				userId: user.user_id,
				email: user.email,
			}
		);

		res.status(200).json({
			message:
				'If an account with that email exists, you will receive a password reset link.',
		});
	} catch (error) {
		await auditLogService.error('Password reset failed', 'email-controller', {
			email,
			error,
		});
		res.status(500).json({
			error: 'An error occurred while processing your request',
		});
	}
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response) => {
	const { token, password } = req.body as { token: string; password: string };

	try {
		await auditLogService.info('Password reset attempt', 'email-controller', {
			token: token?.substring(0, 8) + '...',
			ip: req.ip,
			userAgent: req.get('user-agent'),
		});

		if (!token || !password) {
			return res.status(400).json({
				error: 'Token and password are required',
			});
		}

		// Validate password strength
		if (password.length < 8) {
			return res.status(400).json({
				error: 'Password must be at least 8 characters long',
			});
		}

		// Find valid reset token
		const resetRecord = await PasswordReset.findOne({
			where: {
				token,
				used: false,
				expires_at: {
					[Op.gt]: new Date(),
				},
			},
		});

		if (!resetRecord) {
			return res.status(400).json({
				error: 'Invalid or expired reset token',
			});
		}

		// Find user
		const user = await User.findByPk(resetRecord.user_id);
		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			});
		}

		// Hash new password
		const saltRounds = 12;
		const password_hash = await bcrypt.hash(password, saltRounds);

		// Update user password
		await user.update({ password_hash });

		// Mark reset token as used
		await resetRecord.update({ used: true });

		await auditLogService.info(
			'Password reset successful',
			'email-controller',
			{
				userId: user.user_id,
				email: user.email,
			}
		);

		res.status(200).json({
			message: 'Password reset successful',
		});
	} catch (error) {
		await auditLogService.error('Password reset failed', 'email-controller', {
			token: token?.substring(0, 8) + '...',
			error,
		});
		res.status(500).json({
			error: 'An error occurred while resetting your password',
		});
	}
};

/**
 * Send email verification
 */
export const sendEmailVerification = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const user = req.user!;

		await auditLogService.info(
			'Email verification request',
			'email-controller',
			{
				userId: user.user_id,
				email: user.email,
			}
		);

		if (user.email_verified) {
			return res.status(400).json({
				error: 'Email is already verified',
			});
		}

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Save verification token to database
		await EmailVerification.create({
			user_id: user.user_id,
			token: verificationToken,
			expires_at: expiresAt,
		});

		// Generate verification URL
		const verificationUrl = `${process.env.APP_CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

		// Send email
		const emailHtml = emailService.generateEmailVerificationEmail(
			verificationUrl,
			user.username
		);
		await emailService.sendEmail({
			to: user.email,
			subject: 'Verify Your Email - PairFlix',
			html: emailHtml,
			text: `Hello ${user.username}, Please verify your email address by visiting: ${verificationUrl}`,
		});

		await auditLogService.info('Email verification sent', 'email-controller', {
			userId: user.user_id,
			email: user.email,
		});

		res.status(200).json({
			message: 'Verification email sent',
		});
	} catch (error) {
		await auditLogService.error(
			'Email verification failed',
			'email-controller',
			{
				userId: req.user?.user_id,
				error,
			}
		);
		res.status(500).json({
			error: 'An error occurred while sending verification email',
		});
	}
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
	const { token } = req.body as { token: string };

	try {
		await auditLogService.info(
			'Email verification attempt',
			'email-controller',
			{
				token: token?.substring(0, 8) + '...',
				ip: req.ip,
				userAgent: req.get('user-agent'),
			}
		);

		if (!token) {
			return res.status(400).json({
				error: 'Verification token is required',
			});
		}

		// Find valid verification token
		const verificationRecord = await EmailVerification.findOne({
			where: {
				token,
				verified: false,
				expires_at: {
					[Op.gt]: new Date(),
				},
			},
		});

		if (!verificationRecord) {
			return res.status(400).json({
				error: 'Invalid or expired verification token',
			});
		}

		// Find user
		const user = await User.findByPk(verificationRecord.user_id);
		if (!user) {
			return res.status(404).json({
				error: 'User not found',
			});
		}

		// Update user as verified
		await user.update({ email_verified: true });

		// Mark verification as completed
		await verificationRecord.update({ verified: true });

		await auditLogService.info(
			'Email verification successful',
			'email-controller',
			{
				userId: user.user_id,
				email: user.email,
			}
		);

		// Generate JWT token for automatic login
		const authToken = jwt.sign(
			{
				user_id: user.user_id,
				email: user.email,
				username: user.username,
				role: user.role,
				status: user.status,
				email_verified: true,
				preferences: user.preferences,
			},
			process.env.JWT_SECRET!,
			{ expiresIn: '7d' }
		);

		res.status(200).json({
			message: 'Email verified successfully',
			token: authToken,
			user: {
				user_id: user.user_id,
				email: user.email,
				username: user.username,
				role: user.role,
				status: user.status,
				email_verified: true,
				preferences: user.preferences,
			},
		});
	} catch (error) {
		await auditLogService.error(
			'Email verification failed',
			'email-controller',
			{
				token: token?.substring(0, 8) + '...',
				error,
			}
		);
		res.status(500).json({
			error: 'An error occurred while verifying your email',
		});
	}
};
