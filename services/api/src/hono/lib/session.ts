import { sessions, type Database } from '@pairflix/db';
import { and, eq, ne } from 'drizzle-orm';
import type { Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { randomToken } from './id';
import type { AppEnv } from '../types';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
