import nodemailer from 'nodemailer';
import { auditLogService } from './audit.service';

interface EmailData {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

class EmailService {
	private transporter: nodemailer.Transporter | null = null;
	private isInitialized = false;
	private etherealCredentials: {
		user: string;
		pass: string;
		previewUrl: string;
	} | null = null;
	async initialize() {
		try {
			// Create Ethereal Email test account
			const testAccount = await nodemailer.createTestAccount(); // Store credentials for later access
			this.etherealCredentials = {
				user: testAccount.user,
				pass: testAccount.pass,
				previewUrl: `https://ethereal.email/login?user=${testAccount.user}&pass=${testAccount.pass}`,
			};

			// Create transporter using Ethereal's SMTP server
			this.transporter = nodemailer.createTransport({
				host: 'smtp.ethereal.email',
				port: 587,
				secure: false, // true for 465, false for other ports
				auth: {
					user: testAccount.user,
					pass: testAccount.pass,
				},
			});

			await auditLogService.info('Email service initialized', 'email-service', {
				etherealUser: testAccount.user,
				etherealPass: testAccount.pass,
				previewURL: this.etherealCredentials.previewUrl,
			});

			this.isInitialized = true;

			console.log('Ethereal Email Account Created:');
			console.log('User:', testAccount.user);
			console.log('Pass:', testAccount.pass);
			console.log('Preview URL:', this.etherealCredentials.previewUrl);
		} catch (error) {
			await auditLogService.error(
				'Failed to initialize email service',
				'email-service',
				{ error }
			);
			throw error;
		}
	}

	async sendEmail(
		emailData: EmailData
	): Promise<{ messageId: string; previewUrl: string }> {
		if (!this.isInitialized || !this.transporter) {
			await this.initialize();
		}

		try {
			const info = await this.transporter!.sendMail({
				from: '"PairFlix" <noreply@pairflix.com>',
				to: emailData.to,
				subject: emailData.subject,
				text: emailData.text,
				html: emailData.html,
			});

			const previewUrl = nodemailer.getTestMessageUrl(info) || '';

			await auditLogService.info('Email sent successfully', 'email-service', {
				to: emailData.to,
				subject: emailData.subject,
				messageId: info.messageId,
				previewUrl,
			});

			console.log('Email sent:', info.messageId);
			console.log('Preview URL:', previewUrl);

			return {
				messageId: info.messageId,
				previewUrl,
			};
		} catch (error) {
			await auditLogService.error('Failed to send email', 'email-service', {
				to: emailData.to,
				subject: emailData.subject,
				error,
			});
			throw error;
		}
	}

	generatePasswordResetEmail(resetUrl: string, username: string): string {
		return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Password Reset - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #0f3460; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎬 PairFlix</h1>
				</div>
				<div class="content">
					<h2>Password Reset Request</h2>
					<p>Hello ${username},</p>
					<p>We received a request to reset your password. Click the button below to reset your password:</p>
					<a href="${resetUrl}" class="button">Reset Password</a>
					<p>Or copy and paste this link into your browser:</p>
					<p><a href="${resetUrl}">${resetUrl}</a></p>
					<p>This link will expire in 1 hour.</p>
					<p>If you didn't request this password reset, please ignore this email.</p>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated email. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;
	}

	generateEmailVerificationEmail(
		verificationUrl: string,
		username: string
	): string {
		return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Verify Your Email - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #0f3460; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎬 PairFlix</h1>
				</div>
				<div class="content">
					<h2>Welcome to PairFlix!</h2>
					<p>Hello ${username},</p>
					<p>Thank you for creating an account with PairFlix. To complete your registration, please verify your email address.</p>
					<p>Click the button below to verify your email:</p>
					<a href="${verificationUrl}" class="button">Verify Email</a>
					<p>Or copy and paste this link into your browser:</p>
					<p><a href="${verificationUrl}">${verificationUrl}</a></p>
					<p>This link will expire in 24 hours.</p>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated email. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;
	}

	/**
	 * Send email verification
	 */
	async sendEmailVerification(email: string, username: string, token: string) {
		const verificationUrl = `${process.env.APP_CLIENT_URL}/verify-email?token=${token}`;

		const emailData: EmailData = {
			to: email,
			subject: 'Verify Your PairFlix Account',
			html: this.generateEmailVerificationEmail(verificationUrl, username),
			text: `Hi ${username}, please verify your email by visiting: ${verificationUrl}`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send password reset by admin
	 */
	async sendPasswordResetByAdmin(
		email: string,
		username: string,
		newPassword: string
	) {
		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Password Reset by Administrator - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #e94560; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
				.password { background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 16px; border: 1px solid #ddd; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎬 PairFlix</h1>
				</div>
				<div class="content">
					<h2>Password Reset by Administrator</h2>
					<p>Hello ${username},</p>
					<p>Your PairFlix account password has been reset by an administrator for security reasons.</p>
					<p>Your new temporary password is:</p>
					<div class="password">${newPassword}</div>
					<p><strong>Important:</strong> Please log in and change this password immediately for your security.</p>
					<a href="${process.env.APP_CLIENT_URL}/login" class="button">Login Now</a>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated email. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: 'Your PairFlix Password Has Been Reset',
			html: htmlContent,
			text: `Hi ${username}, your password has been reset by an administrator. Your new temporary password is: ${newPassword}. Please login and change it immediately.`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send forced password reset notification
	 */
	async sendForcedPasswordReset(
		email: string,
		username: string,
		token: string,
		reason: string
	) {
		const resetUrl = `${process.env.APP_CLIENT_URL}/reset-password?token=${token}`;

		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Password Reset Required - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
				.warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎬 PairFlix</h1>
				</div>
				<div class="content">
					<h2>🔒 Password Reset Required</h2>
					<p>Hello ${username},</p>
					<div class="warning">
						<strong>Action Required:</strong> Your account requires a password reset due to: ${reason}
					</div>
					<p>You will not be able to log in until you reset your password using the link below:</p>
					<a href="${resetUrl}" class="button">Reset Password Now</a>
					<p>Or copy and paste this link into your browser:</p>
					<p><a href="${resetUrl}">${resetUrl}</a></p>
					<p>This reset link will expire in 24 hours. If you need assistance, please contact support.</p>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated email. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: 'Password Reset Required - PairFlix',
			html: htmlContent,
			text: `Hi ${username}, your account requires a password reset due to: ${reason}. Please visit: ${resetUrl}`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send security alert notification
	 */
	async sendSecurityAlert(
		email: string,
		username: string,
		alertType: string,
		message: string
	) {
		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Security Alert - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #dc3545; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.alert { background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 4px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🛡️ PairFlix Security Alert</h1>
				</div>
				<div class="content">
					<h2>Security Alert: ${alertType}</h2>
					<p>Hello ${username},</p>
					<div class="alert">
						<strong>Security Notice:</strong> ${message}
					</div>
					<p>If this was not you, please contact support immediately and consider changing your password.</p>
					<a href="${process.env.APP_CLIENT_URL}/login" class="button">Secure My Account</a>
					<p>Best regards,<br>The PairFlix Security Team</p>
				</div>
				<div class="footer">
					<p>This is an automated security alert. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: `Security Alert: ${alertType} - PairFlix`,
			html: htmlContent,
			text: `Security Alert: ${alertType}. ${message}`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send login notification
	 */
	async sendLoginNotification(
		email: string,
		username: string,
		ipAddress: string,
		deviceInfo: string
	) {
		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Login Notification - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #0f3460; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.info-box { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #0f3460; margin: 20px 0; border-radius: 4px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🎬 PairFlix</h1>
				</div>
				<div class="content">
					<h2>New Login Detected</h2>
					<p>Hello ${username},</p>
					<p>We detected a new login to your PairFlix account:</p>
					<div class="info-box">
						<strong>Login Details:</strong><br>
						<strong>Device:</strong> ${deviceInfo}<br>
						<strong>IP Address:</strong> ${ipAddress}<br>
						<strong>Time:</strong> ${new Date().toLocaleString()}
					</div>
					<p>If this was you, you can safely ignore this email.</p>
					<p>If this wasn't you, please secure your account immediately:</p>
					<a href="${process.env.APP_CLIENT_URL}/forgot-password" class="button">Secure My Account</a>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated security notification. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: 'New Login Detected - PairFlix',
			html: htmlContent,
			text: `New login detected on your PairFlix account from ${deviceInfo} (${ipAddress}) at ${new Date().toLocaleString()}`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send password changed notification
	 */
	async sendPasswordChangedNotification(
		email: string,
		username: string,
		changedBy: 'user' | 'admin'
	) {
		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Password Changed - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: #28a745; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.info-box { background-color: ${changedBy === 'admin' ? '#fff3cd' : '#d4edda'}; padding: 15px; border-left: 4px solid ${changedBy === 'admin' ? '#ffc107' : '#28a745'}; margin: 20px 0; border-radius: 4px; }
				.button { display: inline-block; padding: 12px 25px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🔐 PairFlix</h1>
				</div>
				<div class="content">
					<h2>Password Changed Successfully</h2>
					<p>Hello ${username},</p>
					<div class="info-box">
						<strong>Security Notice:</strong> Your PairFlix account password was ${changedBy === 'admin' ? 'changed by an administrator' : 'successfully changed'} on ${new Date().toLocaleString()}.
					</div>
					<p>If you ${changedBy === 'admin' ? 'did not expect this change' : 'did not make this change'}, please contact support immediately.</p>
					${changedBy === 'admin' ? '<p><strong>Important:</strong> Please log in with your new password and change it to something secure that only you know.</p>' : ''}
					<a href="${process.env.APP_CLIENT_URL}/login" class="button">${changedBy === 'admin' ? 'Update My Password' : 'Login to Account'}</a>
					<p>Best regards,<br>The PairFlix Security Team</p>
				</div>
				<div class="footer">
					<p>This is an automated security notification. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: 'Password Changed - PairFlix',
			html: htmlContent,
			text: `Your PairFlix password was ${changedBy === 'admin' ? 'changed by an administrator' : 'successfully changed'} on ${new Date().toLocaleString()}.`,
		};

		await this.sendEmail(emailData);
	}

	/**
	 * Send account status change notification
	 */
	async sendAccountStatusNotification(
		email: string,
		username: string,
		newStatus: string,
		reason?: string
	) {
		const statusColors = {
			active: '#28a745',
			suspended: '#ffc107',
			banned: '#dc3545',
			inactive: '#6c757d',
			pending: '#17a2b8',
		};

		const color =
			statusColors[newStatus as keyof typeof statusColors] || '#6c757d';

		const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Account Status Update - PairFlix</title>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
				.header { background-color: ${color}; color: #fff; padding: 20px; text-align: center; }
				.content { padding: 30px 20px; }
				.status-box { background-color: ${color}15; padding: 15px; border-left: 4px solid ${color}; margin: 20px 0; border-radius: 4px; }
				.button { display: inline-block; padding: 12px 25px; background-color: ${color}; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>📋 PairFlix</h1>
				</div>
				<div class="content">
					<h2>Account Status Update</h2>
					<p>Hello ${username},</p>
					<p>Your PairFlix account status has been updated.</p>
					<div class="status-box">
						<strong>New Status:</strong> ${newStatus.toUpperCase()}<br>
						${reason ? `<strong>Reason:</strong> ${reason}<br>` : ''}
						<strong>Updated:</strong> ${new Date().toLocaleString()}
					</div>
					${
						newStatus === 'active'
							? '<p>Welcome back! You can now access all PairFlix features.</p>'
							: newStatus === 'suspended'
								? '<p>Your account has been temporarily suspended. Please contact support for assistance.</p>'
								: newStatus === 'banned'
									? '<p>Your account has been permanently banned. If you believe this is an error, please contact support.</p>'
									: '<p>Please contact support if you have any questions about this status change.</p>'
					}
					<a href="${process.env.APP_CLIENT_URL}/${newStatus === 'active' ? 'login' : 'contact'}" class="button">
						${newStatus === 'active' ? 'Login to Account' : 'Contact Support'}
					</a>
					<p>Best regards,<br>The PairFlix Team</p>
				</div>
				<div class="footer">
					<p>This is an automated notification. Please do not reply to this message.</p>
				</div>
			</div>
		</body>
		</html>
		`;

		const emailData: EmailData = {
			to: email,
			subject: `Account Status Update: ${newStatus.toUpperCase()} - PairFlix`,
			html: htmlContent,
			text: `Your PairFlix account status has been changed to: ${newStatus.toUpperCase()}. ${reason ? `Reason: ${reason}` : ''}`,
		};
		await this.sendEmail(emailData);
	}

	/**
	 * Get Ethereal credentials for development/testing
	 * Only available in development environment
	 */
	getEtherealCredentials() {
		if (process.env.NODE_ENV === 'production') {
			return null;
		}
		return this.etherealCredentials;
	}
}

export const emailService = new EmailService();
