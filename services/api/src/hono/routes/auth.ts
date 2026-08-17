import { authTokens, createDb, sessions, users } from '@pairflix/db';
import {
	ForgotPasswordRequestSchema,
	LoginRequestSchema,
	RegisterRequestSchema,
	ResendVerificationRequestSchema,
	ResetPasswordRequestSchema,
	VerifyEmailRequestSchema,
} from '@pairflix/lib.validation';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { auditInfo } from '../lib/audit';
import { hashPassword, timingSafeEqual, verifyPassword } from '../lib/crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../lib/email';
import { newId, randomToken } from '../lib/id';
import {
	FAILED_ATTEMPT_LIMIT,
	LOCKOUT_MS,
	endSession,
	startSession,
} from '../lib/session';
import { verifySecondFactor } from '../lib/two-factor';
import { requireAuth } from '../middleware/auth';
import { ipRateLimit } from '../middleware/ip-rate-limit';
import type { AppEnv } from '../types';

export const authRoutes = new Hono<AppEnv>();

const VERIFY_EMAIL_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
/** Per-IP budget for the unauthenticated routes below ('/register', '/forgot-password',
 * '/resend-verification') -- '/login' already has its own account-level lockout above and isn't
 * throttled here. */
const IP_RATE_LIMIT = 5;
const IP_RATE_WINDOW_MINUTES = 15;

authRoutes.get('/csrf-token', c => {
	const token = randomToken();
	setCookie(c, 'csrfToken', token, {
		secure: c.env.ENVIRONMENT !== 'development',
		sameSite: 'Lax',
		path: '/',
		maxAge: 24 * 60 * 60,
	});
	return c.json({ csrfToken: token });
});

const registerRateLimit = ipRateLimit({
	routeName: 'register',
	limit: IP_RATE_LIMIT,
	windowMinutes: IP_RATE_WINDOW_MINUTES,
});

authRoutes.post('/register', registerRateLimit, async c => {
	const parsed = RegisterRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}

	const db = createDb(c.env.DB);
	const existingEmail = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, parsed.data.email))
		.get();
	if (existingEmail)
		return c.json({ error: 'That email is already registered' }, 409);
	const existingUsername = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.username, parsed.data.username))
		.get();
	if (existingUsername)
		return c.json({ error: 'That username is already taken' }, 409);

	const userId = newId('user');
	const now = new Date();
	await db.insert(users).values({
		id: userId,
		username: parsed.data.username,
		email: parsed.data.email,
		passwordHash: await hashPassword(parsed.data.password),
		createdAt: now,
		updatedAt: now,
	});

	const verifyToken = randomToken();
	await db.insert(authTokens).values({
		id: verifyToken,
		userId,
		purpose: 'verify_email',
		expiresAt: new Date(Date.now() + VERIFY_EMAIL_TTL_MS),
		createdAt: now,
	});
	await sendVerificationEmail(c.env, parsed.data.email, verifyToken);

	await auditInfo(db, 'User registered', 'auth', {
		userId,
		email: parsed.data.email,
	});

	// No session here -- email verification is required before login (see '/login' below), so
	// registering doesn't grant access on its own.
	return c.json(
		{
			data: {
				id: userId,
				username: parsed.data.username,
				email: parsed.data.email,
			},
		},
		201
	);
});

authRoutes.post('/login', async c => {
	const parsed = LoginRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) return c.json({ error: 'Invalid input' }, 400);

	const db = createDb(c.env.DB);
	const user = await db
		.select()
		.from(users)
		.where(eq(users.email, parsed.data.email))
		.get();

	if (user?.status === 'suspended') {
		return c.json(
			{ error: 'Account suspended', details: ['Contact support for help'] },
			403
		);
	}
	if (user?.status === 'banned') {
		return c.json(
			{ error: 'Account banned', details: ['Contact support for help'] },
			403
		);
	}

	if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
		const retryAfterSeconds = Math.ceil(
			(user.lockedUntil.getTime() - Date.now()) / 1000
		);
		c.header('Retry-After', String(retryAfterSeconds));
		return c.json(
			{
				error: 'Too many failed attempts',
				details: [`Try again in ${Math.ceil(retryAfterSeconds / 60)}m`],
			},
			429
		);
	}

	// A status: 'pending' account with an unconsumed admin-forced reset token must reset before
	// logging in again with the old password -- checked before password verification so the message
	// is specific rather than a generic "invalid credentials".
	if (user?.status === 'pending') {
		const forcedReset = await db
			.select({ id: authTokens.id })
			.from(authTokens)
			.where(
				and(
					eq(authTokens.userId, user.id),
					eq(authTokens.purpose, 'password_reset'),
					eq(authTokens.forcedByAdmin, true),
					isNull(authTokens.consumedAt),
					gt(authTokens.expiresAt, new Date())
				)
			)
			.get();
		if (forcedReset) {
			return c.json(
				{
					error: 'You must reset your password before logging in',
					details: ['Check your email for reset instructions.'],
				},
				403
			);
		}
	}

	// Unknown email: leave lockout state untouched (there's no user row to update), so this stays
	// indistinguishable from a bad password -- no side channel reveals whether the email is registered.
	const recordFailure = async (
		knownUser: NonNullable<typeof user>
	): Promise<void> => {
		const attempts = knownUser.failedLoginAttempts + 1;
		const locked = attempts >= FAILED_ATTEMPT_LIMIT;
		await db
			.update(users)
			.set({
				failedLoginAttempts: locked ? 0 : attempts,
				lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MS) : null,
			})
			.where(eq(users.id, knownUser.id));
	};

	if (
		!user ||
		!(await verifyPassword(parsed.data.password, user.passwordHash))
	) {
		if (user) await recordFailure(user);
		return c.json({ error: 'Invalid email or password' }, 401);
	}

	if (user.totpEnabled) {
		if (!parsed.data.totpCode) {
			await recordFailure(user);
			return c.json({ error: 'TOTP code required' }, 401);
		}
		const result = await verifySecondFactor(
			user,
			parsed.data.totpCode,
			c.env.SESSION_SECRET ?? ''
		);
		if (!result.ok) {
			await recordFailure(user);
			return c.json({ error: 'Invalid or expired code' }, 401);
		}
		if (result.consumedBackupCodes) {
			await db
				.update(users)
				.set({ totpBackupCodes: result.consumedBackupCodes })
				.where(eq(users.id, user.id));
		}
	}

	await db
		.update(users)
		.set({ failedLoginAttempts: 0, lockedUntil: null })
		.where(eq(users.id, user.id));

	if (!user.emailVerified) {
		return c.json(
			{
				error: 'Verify your email before logging in',
				details: [
					'Check your inbox for the verification link, or request a new one below.',
				],
			},
			403
		);
	}
	if (user.status === 'pending') {
		return c.json(
			{
				error: 'Your account is pending activation',
				details: ['Contact support for help.'],
			},
			403
		);
	}

	await auditInfo(db, 'User logged in', 'auth', {
		userId: user.id,
		email: user.email,
	});

	await startSession(c, db, user.id);

	// Only set once the session actually exists -- best-effort from here on, since the login has
	// already succeeded (the client already has a session cookie): a failure updating this
	// bookkeeping column shouldn't turn an otherwise-successful login into a 500. Setting it any
	// earlier risks the reverse problem this fixes -- a non-null "Last Login" (which the admin CSV
	// export treats as a real last-successful-login timestamp) even though `startSession` itself
	// then failed and no session was actually granted.
	try {
		await db
			.update(users)
			.set({ lastLogin: new Date() })
			.where(eq(users.id, user.id));
	} catch (error) {
		console.error('[auth] failed to update lastLogin', error);
	}

	return c.json({
		data: { id: user.id, username: user.username, email: user.email },
	});
});

authRoutes.post('/logout', async c => {
	const token = getCookie(c, 'session');
	if (token) {
		const db = createDb(c.env.DB);
		const user = await db
			.select({ id: users.id, email: users.email })
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, token))
			.get();
		await endSession(c, db, token);
		if (user) {
			await auditInfo(db, 'User logged out', 'auth', {
				userId: user.id,
				email: user.email,
			});
		}
	}
	return c.body(null, 204);
});

authRoutes.get('/me', async c => {
	const userId = c.get('userId');
	if (!userId) return c.json({ error: 'Authentication required' }, 401);

	const db = createDb(c.env.DB);
	const user = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			role: users.role,
			status: users.status,
			emailVerified: users.emailVerified,
			totpEnabled: users.totpEnabled,
			preferences: users.preferences,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	return c.json({ data: user });
});

authRoutes.post('/verify-email', async c => {
	const parsed = VerifyEmailRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}

	const db = createDb(c.env.DB);
	const row = await db
		.select()
		.from(authTokens)
		.where(
			and(
				eq(authTokens.id, parsed.data.token),
				eq(authTokens.purpose, 'verify_email')
			)
		)
		.get();
	if (!row || row.consumedAt || row.expiresAt.getTime() < Date.now()) {
		return c.json({ error: 'Invalid or expired verification link' }, 400);
	}

	const verified = await db
		.update(users)
		.set({ emailVerified: true })
		.where(eq(users.id, row.userId))
		.returning({ id: users.id, email: users.email })
		.get();
	await db
		.update(authTokens)
		.set({ consumedAt: new Date() })
		.where(eq(authTokens.id, row.id));
	if (verified) {
		await auditInfo(db, 'Email verified', 'auth', {
			userId: verified.id,
			email: verified.email,
		});
	}
	return c.json({ data: { verified: true } });
});

authRoutes.post('/verify-email/resend', requireAuth, async c => {
	const userId = c.get('userId') as string;
	const db = createDb(c.env.DB);
	const user = await db
		.select({
			id: users.id,
			email: users.email,
			emailVerified: users.emailVerified,
		})
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (user.emailVerified) return c.json({ data: { alreadyVerified: true } });

	const verifyToken = randomToken();
	await db.insert(authTokens).values({
		id: verifyToken,
		userId: user.id,
		purpose: 'verify_email',
		expiresAt: new Date(Date.now() + VERIFY_EMAIL_TTL_MS),
		createdAt: new Date(),
	});
	await sendVerificationEmail(c.env, user.email, verifyToken);
	await auditInfo(db, 'Verification email resent', 'auth', {
		userId: user.id,
		email: user.email,
	});
	return c.json({ data: { sent: true } });
});

/**
 * Unauthenticated counterpart to '/verify-email/resend' -- registering no longer starts a session
 * (see '/register' above), so someone who missed the first email has no session to resend it with.
 * Same anti-enumeration shape as '/forgot-password': always the same response either way.
 */
const resendVerificationRateLimit = ipRateLimit({
	routeName: 'resend-verification',
	limit: IP_RATE_LIMIT,
	windowMinutes: IP_RATE_WINDOW_MINUTES,
});

authRoutes.post(
	'/resend-verification',
	resendVerificationRateLimit,
	async c => {
		const parsed = ResendVerificationRequestSchema.safeParse(
			await c.req.json().catch(() => null)
		);
		if (!parsed.success) {
			return c.json(
				{
					error: 'Invalid input',
					details: parsed.error.issues.map(i => i.message),
				},
				400
			);
		}

		const db = createDb(c.env.DB);
		const user = await db
			.select({
				id: users.id,
				email: users.email,
				emailVerified: users.emailVerified,
			})
			.from(users)
			.where(eq(users.email, parsed.data.email))
			.get();
		if (user && !user.emailVerified) {
			const verifyToken = randomToken();
			await db.insert(authTokens).values({
				id: verifyToken,
				userId: user.id,
				purpose: 'verify_email',
				expiresAt: new Date(Date.now() + VERIFY_EMAIL_TTL_MS),
				createdAt: new Date(),
			});
			await sendVerificationEmail(c.env, user.email, verifyToken);
			await auditInfo(db, 'Verification email resent', 'auth', {
				userId: user.id,
				email: user.email,
			});
		}
		// Same response either way -- must never reveal whether an email is registered or verified.
		return c.json({ data: { sent: true } });
	}
);

const forgotPasswordRateLimit = ipRateLimit({
	routeName: 'forgot-password',
	limit: IP_RATE_LIMIT,
	windowMinutes: IP_RATE_WINDOW_MINUTES,
});

authRoutes.post('/forgot-password', forgotPasswordRateLimit, async c => {
	const parsed = ForgotPasswordRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}

	const db = createDb(c.env.DB);
	const user = await db
		.select({ id: users.id, email: users.email })
		.from(users)
		.where(eq(users.email, parsed.data.email))
		.get();
	if (user) {
		const resetToken = randomToken();
		await db.insert(authTokens).values({
			id: resetToken,
			userId: user.id,
			purpose: 'password_reset',
			expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
			createdAt: new Date(),
		});
		await sendPasswordResetEmail(c.env, user.email, resetToken);
		await auditInfo(db, 'Password reset requested', 'auth', {
			userId: user.id,
			email: user.email,
		});
	}
	// Same response either way -- this endpoint must never reveal whether an email is registered.
	return c.json({ data: { sent: true } });
});

authRoutes.post('/reset-password', async c => {
	const parsed = ResetPasswordRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}

	const db = createDb(c.env.DB);
	const row = await db
		.select()
		.from(authTokens)
		.where(
			and(
				eq(authTokens.id, parsed.data.token),
				eq(authTokens.purpose, 'password_reset')
			)
		)
		.get();
	if (!row || row.consumedAt || row.expiresAt.getTime() < Date.now()) {
		return c.json({ error: 'Invalid or expired reset link' }, 400);
	}

	// A forced reset restores a 'pending' account to 'active'; leaves any other status untouched.
	const target = await db
		.select({ status: users.status })
		.from(users)
		.where(eq(users.id, row.userId))
		.get();
	const nextStatus =
		row.forcedByAdmin && target?.status === 'pending'
			? 'active'
			: target?.status;

	const updated = await db
		.update(users)
		.set({
			passwordHash: await hashPassword(parsed.data.password),
			status: nextStatus,
		})
		.where(eq(users.id, row.userId))
		.returning({ id: users.id, email: users.email, status: users.status })
		.get();
	if (!updated) return c.json({ error: 'Invalid or expired reset link' }, 400);

	await db
		.update(authTokens)
		.set({ consumedAt: new Date() })
		.where(eq(authTokens.id, row.id));
	await auditInfo(db, 'Password reset completed', 'auth', {
		userId: updated.id,
		email: updated.email,
		forcedByAdmin: Boolean(row.forcedByAdmin),
	});

	if (updated.status === 'suspended' || updated.status === 'banned') {
		// Password is updated, but a reset shouldn't be a way around suspension/ban -- no session either.
		return c.json(
			{
				error: 'Account suspended',
				details: ['Your password was updated, but this account is suspended.'],
			},
			403
		);
	}

	// Password reset means every prior session is untrusted -- sign the whole account out.
	await db.delete(sessions).where(eq(sessions.userId, row.userId));
	await startSession(c, db, row.userId);
	return c.json({ data: { id: updated.id, email: updated.email } });
});

/**
 * One-time way to create the first prod admin without direct DB access -- self-disabling rather
 * than tracked by a "used" flag: it only succeeds while zero admins exist, so once the first admin
 * is claimed this permanently 409s for everyone, including whoever still has the secret. Log in
 * normally first (register + `/login`), then call this to promote *that* session's user -- never an
 * arbitrary email, so knowing the secret alone isn't enough to take over someone else's account.
 * Adding further admins after the first is a manual `UPDATE users SET role = 'admin' ...`. Note:
 * `requireAdmin` also demands TOTP enrollment, so a freshly-bootstrapped admin still can't reach
 * other admin routes until they enroll via `POST /api/me/2fa/enroll`.
 */
authRoutes.post('/bootstrap-admin', requireAuth, async c => {
	const secret = c.env.ADMIN_BOOTSTRAP_SECRET;
	if (!secret) return c.json({ error: 'Bootstrap not configured' }, 501);

	const provided = c.req.header('x-bootstrap-secret') ?? '';
	if (!timingSafeEqual(provided, secret))
		return c.json({ error: 'Forbidden' }, 403);

	const db = createDb(c.env.DB);
	const existingAdmin = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.role, 'admin'))
		.get();
	if (existingAdmin) return c.json({ error: 'An admin already exists' }, 409);

	const userId = c.get('userId') as string;
	const updated = await db
		.update(users)
		.set({ role: 'admin' })
		.where(eq(users.id, userId))
		.returning({ id: users.id, email: users.email, role: users.role })
		.get();
	if (updated) {
		await auditInfo(db, 'Bootstrapped first admin', 'auth', {
			userId: updated.id,
			email: updated.email,
		});
	}
	return c.json({ data: updated });
});
