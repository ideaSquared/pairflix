import { createDb, sessions, users } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';

/** Resolves the session cookie to a user id (or null) on every request. Joins `users.status` so a
 * suspend/ban takes effect on the next request even though nothing revoked the session row itself
 * -- only `PATCH /admin/users/:userId/status` does that; the generic admin user PATCH doesn't. */
export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	c.set('userId', null);
	const token = getCookie(c, 'session');
	if (token) {
		const db = createDb(c.env.DB);
		const row = await db
			.select({
				userId: sessions.userId,
				expiresAt: sessions.expiresAt,
				status: users.status,
			})
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, token))
			.get();
		const isBlockedStatus =
			row?.status === 'suspended' || row?.status === 'banned';
		if (row && row.expiresAt.getTime() > Date.now() && !isBlockedStatus) {
			c.set('userId', row.userId);
		}
	}
	await next();
});

/** Gate for authenticated endpoints -- 401s when there is no authenticated user. */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
	if (!c.get('userId'))
		return c.json({ error: 'Authentication required' }, 401);
	return next();
});

/**
 * Gate for admin endpoints -- 403s unless the authenticated user has `role: 'admin'` AND has TOTP
 * enrolled. Must run after `requireAuth`. Not folded into `sessionMiddleware`/`Variables`: this is a
 * low-traffic admin-only surface, not worth an extra join on every request the app serves.
 *
 * The 2FA requirement is enforced here, not at login -- an admin can still log in with just a
 * password (same `/auth/login` flow as every other account), but no admin route is reachable until
 * TOTP is enrolled via `/auth/2fa/enroll`. `apps/admin`'s route guard mirrors this check
 * client-side for UX, but this is the real gate.
 */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
	const userId = c.get('userId');
	const db = createDb(c.env.DB);
	const user = userId
		? await db
				.select({ role: users.role, totpEnabled: users.totpEnabled })
				.from(users)
				.where(eq(users.id, userId))
				.get()
		: null;
	if (user?.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);
	if (!user.totpEnabled) {
		return c.json(
			{
				error: 'Two-factor authentication is required for admin accounts',
				details: ['Enable 2FA from account settings, then retry.'],
			},
			403
		);
	}
	return next();
});
