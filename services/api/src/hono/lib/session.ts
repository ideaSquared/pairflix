import { sessions, type Database } from '@pairflix/db';
import { and, eq, ne } from 'drizzle-orm';
import type { Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { randomToken } from './id';
import type { AppEnv } from '../types';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** After this many bad login attempts in a row, an account is locked out for `LOCKOUT_MS`. Lives
 * here (not `routes/auth.ts`, the only place that enforces it) so `lib/adminUsers.ts`'s
 * locked-accounts view can use the exact same threshold instead of drifting out of sync with it --
 * the current Express admin panel's locked-accounts list uses a hardcoded `3`, inconsistent with
 * the real lockout threshold of `5` enforced at login. */
export const FAILED_ATTEMPT_LIMIT = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export const startSession = async (
	c: Context<AppEnv>,
	db: Database,
	userId: string
): Promise<void> => {
	const token = randomToken();
	const now = Date.now();
	await db.insert(sessions).values({
		id: token,
		userId,
		expiresAt: new Date(now + SESSION_TTL_MS),
		// 'cf-connecting-ip' is Cloudflare's own header carrying the real client IP.
		ipAddress: c.req.header('cf-connecting-ip') ?? null,
		userAgent: c.req.header('user-agent') ?? null,
		createdAt: new Date(now),
	});
	setCookie(c, 'session', token, {
		httpOnly: true,
		secure: c.env.ENVIRONMENT !== 'development',
		sameSite: 'Lax',
		path: '/',
		maxAge: SESSION_TTL_MS / 1000,
	});
};

export const endSession = async (
	c: Context<AppEnv>,
	db: Database,
	token: string
): Promise<void> => {
	await db.delete(sessions).where(eq(sessions.id, token));
	deleteCookie(c, 'session', { path: '/' });
};

/** Deletes every session for a user except the one given -- used after a password change,
 * 2FA disable/enable, or account suspension (treat every OTHER device's session as untrusted). */
export const revokeOtherSessions = async (
	db: Database,
	userId: string,
	keepSessionId: string
): Promise<number> => {
	const result = await db
		.delete(sessions)
		.where(and(eq(sessions.userId, userId), ne(sessions.id, keepSessionId)))
		.returning({ id: sessions.id });
	return result.length;
};

/** Deletes every session for a user, including whichever one the caller (an admin) is acting
 * through -- there's no "keep this one" exception, unlike `revokeOtherSessions`. Used when an
 * admin suspends/bans an account or explicitly terminates all of a user's sessions; unlike
 * Express's decorative `UserSession` rows, deleting here takes effect immediately since a Hono
 * session row is the live credential `sessionMiddleware` looks up on every request. */
export const revokeAllSessions = async (
	db: Database,
	userId: string
): Promise<number> => {
	const result = await db
		.delete(sessions)
		.where(eq(sessions.userId, userId))
		.returning({ id: sessions.id });
	return result.length;
};
