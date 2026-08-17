import type { Bindings } from '../types';

type SendEmailOptions = { to: string; subject: string; html: string };

/**
 * Hand-rolled Resend REST client -- raw fetch, no SDK. Workers can't do SMTP (no raw TCP), so this
 * replaces the current Express app's nodemailer/Ethereal setup, which only ever worked against a
 * fake test inbox anyway. Degrades gracefully when unconfigured: logs instead of failing, matching
 * the "unconfigured is a valid state" pattern (see CLAUDE.md's Stripe section for the same idea).
 */
export const sendEmail = async (
	env: Bindings,
	opts: SendEmailOptions
): Promise<void> => {
	if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
		console.warn(
			`[email] not configured -- would send "${opts.subject}" to ${opts.to}`
		);
		if (env.ENVIRONMENT === 'development') {
			console.warn(`[email] dev fallback, content:\n${opts.html}`);
		}
		return;
	}
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM,
			to: opts.to,
			subject: opts.subject,
			html: opts.html,
		}),
	});
	if (!response.ok) {
		console.error(
			'[email] send failed',
			response.status,
			await response.text()
		);
	}
};

const clientUrl = (env: Bindings): string =>
	env.APP_CLIENT_URL ?? 'http://localhost:5173';

/** Escapes free-text values before interpolating them into an HTML email body -- the only such
 * value in this file is `sendAccountStatusEmail`'s admin-supplied `reason`. */
const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

export const sendVerificationEmail = async (
	env: Bindings,
	email: string,
	token: string
): Promise<void> => {
	const link = `${clientUrl(env)}/verify-email?token=${token}`;
	await sendEmail(env, {
		to: email,
		subject: 'Verify your Pairflix email',
		html: `<p>Confirm your email address:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
	});
};

export const sendPasswordResetEmail = async (
	env: Bindings,
	email: string,
	token: string
): Promise<void> => {
	const link = `${clientUrl(env)}/reset-password?token=${token}`;
	await sendEmail(env, {
		to: email,
		subject: 'Reset your Pairflix password',
		html: `<p>Reset your password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
	});
};

/** Delivers a plaintext password an admin just generated for a user (`lib/adminUsers.ts`'s
 * `resetPassword`) -- a deliberate, existing product behavior (not a bug to design around): the
 * admin chooses whether to email it or have it returned in the API response instead. */
export const sendAdminPasswordResetEmail = async (
	env: Bindings,
	email: string,
	newPassword: string
): Promise<void> => {
	await sendEmail(env, {
		to: email,
		subject: 'Your Pairflix password was reset',
		html: `<p>An administrator reset your password.</p><p>Your new password: <strong>${newPassword}</strong></p><p>Sign in and change it as soon as possible.</p>`,
	});
};

/** Notifies a user their account status changed at an admin's hand -- suspend/ban/reactivate are
 * the statuses worth a user-facing explanation; other transitions (e.g. 'pending') don't come
 * through this admin-initiated path. */
export const sendAccountStatusEmail = async (
	env: Bindings,
	email: string,
	status: 'active' | 'suspended' | 'banned',
	reason?: string
): Promise<void> => {
	const subject =
		status === 'active'
			? 'Your Pairflix account has been reactivated'
			: `Your Pairflix account has been ${status}`;
	const reasonHtml = reason ? `<p>Reason: ${escapeHtml(reason)}</p>` : '';
	await sendEmail(env, {
		to: email,
		subject,
		html: `<p>${subject}.</p>${reasonHtml}<p>Contact support if you have questions.</p>`,
	});
};
