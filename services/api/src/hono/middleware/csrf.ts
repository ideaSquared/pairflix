import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { timingSafeEqual } from '../lib/crypto';
import type { AppEnv } from '../types';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit-cookie CSRF protection (ADR 0002). Enforced only when the request is
 * cookie-authenticated, so it pairs with the frontend API client which fetches
 * `GET /api/auth/csrf-token` and echoes the `csrfToken` cookie value back as the `x-csrf-token`
 * header on writes.
 */
export const csrfMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	if (SAFE_METHODS.has(c.req.method)) return next();

	const cookieToken = getCookie(c, 'csrfToken');
	const sessionToken = getCookie(c, 'session');
	if (cookieToken || sessionToken) {
		const headerToken = c.req.header('x-csrf-token');
		if (
			!cookieToken ||
			!headerToken ||
			!timingSafeEqual(cookieToken, headerToken)
		) {
			return c.json({ error: 'CSRF token missing or invalid' }, 403);
		}
	}
	return next();
});
