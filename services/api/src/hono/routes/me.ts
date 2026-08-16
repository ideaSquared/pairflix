import { createDb, users } from '@pairflix/db';
import {
	TotpDisableRequestSchema,
	TotpVerifyRequestSchema,
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
import { revokeOtherSessions } from '../lib/session';
import { verifySecondFactor } from '../lib/two-factor';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

/**
 * Scoped to 2FA management for now -- the rest of creatorgrid's `me.ts` (profile updates, email
 * change, avatar) isn't part of this P3 auth-domain pass. Grows as later domains need it.
 */
export const meRoutes = new Hono<AppEnv>();

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

	const totpSecret = await decryptSecret(user.totpSecret, sessionSecret);
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
