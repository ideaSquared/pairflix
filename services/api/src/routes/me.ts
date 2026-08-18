import { authTokens, createDb, users } from '@pairflix/db';
import {
	TotpDisableRequestSchema,
	TotpVerifyRequestSchema,
	UpdateEmailRequestSchema,
	UpdatePasswordRequestSchema,
	UpdatePreferencesRequestSchema,
	UpdateUsernameRequestSchema,
} from '@pairflix/lib.validation';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { auditInfo } from '../lib/audit';
import {
	buildOtpAuthUrl,
	generateBackupCodes,
	generateTotpSecret,
	verifyTotpCode,
} from '../lib/totp';
import {
	decryptSecret,
	encryptSecret,
	hashPassword,
	verifyPassword,
} from '../lib/crypto';
import { sendVerificationEmail } from '../lib/email';
import { randomToken } from '../lib/id';
import { revokeOtherSessions } from '../lib/session';
import { verifySecondFactor } from '../lib/two-factor';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const VERIFY_EMAIL_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 2FA management plus profile updates (username/email/password/preferences) -- avatar isn't part
 * of this pass, nothing in the schema or either frontend app references one yet.
 */
export const meRoutes = new Hono<AppEnv>();

// Drizzle wraps the D1 driver's rejection in a DrizzleQueryError whose own .message is just "Failed
// query: ..." -- the actual "UNIQUE constraint failed: users.username: SQLITE_CONSTRAINT" text is
// on a nested .cause (D1's error wraps the raw SQLite one), so this walks the chain instead of
// checking .message directly.
const isUniqueConstraintViolation = (error: unknown): boolean =>
	error instanceof Error &&
	(error.message.includes('UNIQUE constraint failed') ||
		isUniqueConstraintViolation(error.cause));

meRoutes.use('*', requireAuth);

meRoutes.post('/2fa/enroll', async c => {
	const userId = c.get('userId') as string;
	const sessionSecret = c.env.SESSION_SECRET;
	if (!sessionSecret) {
		return c.json({ error: 'Two-factor authentication is not available' }, 501);
	}

	const db = createDb(c.env.DB);
	const user = await db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (user.totpEnabled) return c.json({ error: '2FA is already enabled' }, 409);

	const secret = generateTotpSecret();
	const encrypted = await encryptSecret(secret, sessionSecret);
	await db
		.update(users)
		.set({ totpSecret: encrypted })
		.where(eq(users.id, userId));
	// The plaintext secret is only ever returned here, for the user's authenticator app -- the
	// stored copy is encrypted (see decryptSecret at the read sites).
	return c.json({
		data: { secret, otpauthUrl: buildOtpAuthUrl(secret, user.email) },
	});
});

meRoutes.post('/2fa/verify', async c => {
	const userId = c.get('userId') as string;
	const sessionSecret = c.env.SESSION_SECRET;
	if (!sessionSecret) {
		return c.json({ error: 'Two-factor authentication is not available' }, 501);
	}

	const parsed = TotpVerifyRequestSchema.safeParse(
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
	const user = await db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (!user.totpSecret)
		return c.json({ error: 'Start 2FA enrollment first' }, 400);

	// A corrupted secret or a SESSION_SECRET rotated since /2fa/enroll shouldn't 500 a user-facing
	// auth flow -- treat it the same as an invalid code below.
	let totpSecret: string;
	try {
		totpSecret = await decryptSecret(user.totpSecret, sessionSecret);
	} catch (error) {
		console.error('[me] 2FA verify: TOTP secret decrypt failed', error);
		return c.json({ error: 'Invalid or expired code' }, 401);
	}
	if (!(await verifyTotpCode(totpSecret, parsed.data.code))) {
		return c.json({ error: 'Invalid or expired code' }, 401);
	}

	const backupCodes = generateBackupCodes();
	const backupCodeHashes = await Promise.all(
		backupCodes.map(code => hashPassword(code))
	);
	await db
		.update(users)
		.set({
			totpEnabled: true,
			totpBackupCodes: JSON.stringify(backupCodeHashes),
		})
		.where(eq(users.id, userId));

	await auditInfo(db, '2FA enrolled', 'auth', { userId, email: user.email });

	return c.json({ data: { backupCodes } });
});

meRoutes.post('/2fa/disable', async c => {
	const userId = c.get('userId') as string;
	const parsed = TotpDisableRequestSchema.safeParse(
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
	const user = await db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (!user.totpEnabled) return c.json({ error: '2FA is not enabled' }, 400);
	if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
		return c.json({ error: 'Current password is incorrect' }, 401);
	}
	if (
		!(
			await verifySecondFactor(
				user,
				parsed.data.code,
				c.env.SESSION_SECRET ?? ''
			)
		).ok
	) {
		return c.json({ error: 'Invalid or expired code' }, 401);
	}

	await db
		.update(users)
		.set({ totpEnabled: false, totpSecret: null, totpBackupCodes: null })
		.where(eq(users.id, userId));

	const currentSessionId = getCookie(c, 'session');
	if (currentSessionId) {
		await revokeOtherSessions(db, userId, currentSessionId);
	}

	await auditInfo(db, '2FA disabled', 'auth', { userId, email: user.email });

	return c.body(null, 204);
});

meRoutes.patch('/username', async c => {
	const userId = c.get('userId') as string;
	const parsed = UpdateUsernameRequestSchema.safeParse(
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
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.username, parsed.data.username))
		.get();
	if (existing && existing.id !== userId) {
		return c.json({ error: 'username_taken' }, 409);
	}

	// The check above isn't atomic with this write -- a concurrent request can still claim
	// `username` in between. Drizzle's SQLite update builder has no onConflictDoNothing (that's
	// insert-only, see '/register' above), so the write itself is guarded by catching the
	// underlying unique-constraint violation instead, same intent as '/verify-email's re-check
	// immediately before its write: a genuine race must 409, not throw past this handler.
	let updated: { id: string; username: string } | undefined;
	try {
		updated = await db
			.update(users)
			.set({ username: parsed.data.username, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning({ id: users.id, username: users.username })
			.get();
	} catch (error) {
		if (isUniqueConstraintViolation(error)) {
			return c.json({ error: 'username_taken' }, 409);
		}
		throw error;
	}
	if (!updated) return c.json({ error: 'Not found' }, 404);

	await auditInfo(db, 'Username changed', 'auth', { userId });
	return c.json({ data: updated });
});

/**
 * Doesn't change `users.email` directly -- creates a 'change_email' auth token (see
 * `authTokens.newEmail`) and emails the confirmation link to the NEW address, so the swap only
 * happens once the caller has proven they actually control it (same token consumed by
 * `POST /api/auth/verify-email`). Mirrors how registration itself requires verification before
 * the address is trusted.
 */
meRoutes.post('/email', async c => {
	const userId = c.get('userId') as string;
	const parsed = UpdateEmailRequestSchema.safeParse(
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
	const user = await db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
		return c.json({ error: 'Current password is incorrect' }, 401);
	}
	if (parsed.data.email === user.email) {
		return c.json({ error: 'That is already your email address' }, 400);
	}

	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, parsed.data.email))
		.get();
	if (existing) return c.json({ error: 'email_taken' }, 409);

	const token = randomToken();
	const now = new Date();
	await db.insert(authTokens).values({
		id: token,
		userId,
		purpose: 'change_email',
		newEmail: parsed.data.email,
		expiresAt: new Date(now.getTime() + VERIFY_EMAIL_TTL_MS),
		createdAt: now,
	});
	await sendVerificationEmail(c.env, parsed.data.email, token);

	await auditInfo(db, 'Email change requested', 'auth', {
		userId,
		newEmail: parsed.data.email,
	});
	return c.json({ data: { pending: true } });
});

meRoutes.post('/password', async c => {
	const userId = c.get('userId') as string;
	const parsed = UpdatePasswordRequestSchema.safeParse(
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
	const user = await db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return c.json({ error: 'Not found' }, 404);
	if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
		return c.json({ error: 'Current password is incorrect' }, 401);
	}

	await db
		.update(users)
		.set({
			passwordHash: await hashPassword(parsed.data.newPassword),
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId));

	const currentSessionId = getCookie(c, 'session');
	if (currentSessionId) {
		await revokeOtherSessions(db, userId, currentSessionId);
	}

	await auditInfo(db, 'Password changed', 'auth', { userId });
	return c.body(null, 204);
});

meRoutes.patch('/preferences', async c => {
	const userId = c.get('userId') as string;
	const parsed = UpdatePreferencesRequestSchema.safeParse(
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
		.select({ preferences: users.preferences })
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (!user) return c.json({ error: 'Not found' }, 404);

	const preferences = { ...user.preferences, ...parsed.data.preferences };
	await db
		.update(users)
		.set({ preferences, updatedAt: new Date() })
		.where(eq(users.id, userId));

	return c.json({ data: { preferences } });
});
