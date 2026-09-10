import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { timingSafeEqual } from '../lib/crypto';
import type { AppEnv } from '../types';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const hasValidCsrfToken = (c: Context<AppEnv>): boolean => {
	const cookieToken = getCookie(c, 'csrfToken');
	const headerToken = c.req.header('x-csrf-token');
	return Boolean(
		cookieToken && headerToken && timingSafeEqual(cookieToken, headerToken)
	);
};

/**
 * Double-submit-cookie CSRF protection (ADR 0002). Enforced whenever a `csrfToken` or `session`
 * cookie is present -- not gated on being logged in -- so it pairs with the frontend API client,
 * which always fetches `GET /api/auth/csrf-token` (seeding the cookie) before any write, whether
 * or not the caller is authenticated yet. A caller with neither cookie yet is exempted here (there
 * is nothing to double-submit against); '/login' additionally mounts `requireCsrfToken` below,
 * which closes that gap for the one route where it matters -- a cookie-less victim's browser has
 * ambient authority (none yet) worth forging into: a cross-site POST that logs them into an
 * attacker-controlled account (login CSRF).
 */
export const csrfMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	if (SAFE_METHODS.has(c.req.method)) return next();

	const cookieToken = getCookie(c, 'csrfToken');
	const sessionToken = getCookie(c, 'session');
	if ((cookieToken || sessionToken) && !hasValidCsrfToken(c)) {
		return c.json({ error: 'CSRF token missing or invalid' }, 403);
	}
	return next();
});

/** Same double-submit check as `csrfMiddleware`, but unconditional -- see that middleware's doc
 * comment for why '/login' needs this instead of the cookie-gated default. */
export const requireCsrfToken = createMiddleware<AppEnv>(async (c, next) => {
	if (!hasValidCsrfToken(c)) {
		return c.json({ error: 'CSRF token missing or invalid' }, 403);
	}
	return next();
});
