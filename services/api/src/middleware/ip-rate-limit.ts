import { createDb } from '@pairflix/db';
import { sql } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import { newId } from '../lib/id';
import type { AppEnv } from '../types';

type IpRateLimitOptions = {
	/** Distinguishes this route's budget from others sharing the same IP -- part of the storage key. */
	routeName: string;
	/** Requests allowed per IP within `windowMinutes` before a 429. */
	limit: number;
	windowMinutes: number;
};

/**
 * Per-IP rate limiter, primarily for unauthenticated routes (registration, login,
 * forgot-password/reset-password, resend-verification) that run before any session exists, so
 * there's no user id to key on -- also reused for the authenticated 2FA verify/disable routes
 * (`routes/me.ts`), where the resource being brute-forced (a 6-digit code) has no other per-IP
 * throttle. Counts `rateLimitHits` rows sharing this route+IP key rather than a separate counter
 * binding.
 *
 * Old rows are pruned by the nightly retention sweep (`lib/retention.ts`), so the table does not
 * grow without bound on unauthenticated traffic.
 */
export const ipRateLimit = (options: IpRateLimitOptions) => {
	const { routeName, limit, windowMinutes } = options;

	return createMiddleware<AppEnv>(async (c, next) => {
		const ip = c.req.header('cf-connecting-ip');
		// Real Cloudflare edge always sets this header -- its absence means the request never passed
		// through Cloudflare (local `wrangler dev`, or a test calling the Worker's fetch export
		// directly without one). Skipping in that case only affects local/dev; anything reaching
		// production always has a real `cf-connecting-ip`.
		if (!ip) return next();
		const key = `${routeName}:${ip}`;
		const db = createDb(c.env.DB);

		// One guarded INSERT: the count and the write run as a single D1 statement, so concurrent
		// requests can't all read the same pre-write count and all pass (see `reserveDailyPick`).
		const windowStart = Date.now() - windowMinutes * 60_000;
		const result = await db.run(sql`
			insert into rate_limit_hits (id, key, created_at)
			select ${newId('ratelimit')}, ${key}, ${Date.now()}
			where (
				select count(*) from rate_limit_hits
				where key = ${key} and created_at >= ${windowStart}
			) < ${limit}
		`);

		if (result.meta.changes === 0) {
			c.header('Retry-After', String(windowMinutes * 60));
			return c.json(
				{
					error: 'Too many requests',
					details: [
						`Limit is ${limit} per ${windowMinutes} minutes -- try again shortly`,
					],
				},
				429
			);
		}

		return next();
	});
};
