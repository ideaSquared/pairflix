import { createDb, pickUsage, type Database } from '@pairflix/db';
import { eq, sql } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import { getEntitlements } from '../lib/entitlements';
import { newId } from '../lib/id';
import type { AppEnv } from '../types';

/**
 * Computes entitlements once and stores them on context for `enforcePickQuota` (and the pick
 * route handler, which applies `entitlements.regionLock` over the request's own region) to
 * reuse -- the current Express app recomputes entitlements independently in both of its
 * equivalent middleware. Never rejects for entitlement reasons; the only rejection is a missing
 * `:id` path param, which would mean this middleware was mounted on the wrong route.
 *
 * Must run after `requireHouseholdMember`; must run before `enforcePickQuota`.
 */
export const enforceRegionLock = createMiddleware<AppEnv>(async (c, next) => {
	const householdId = c.req.param('id');
	if (!householdId) return c.json({ error: 'household_id_required' }, 400);
	const db = createDb(c.env.DB);
	const entitlements = await getEntitlements(db, householdId);
	c.set('entitlements', entitlements);
	return next();
});

const startOfTodayUtc = (): Date => {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	);
};

/**
 * Atomically records a pick against today's usage only if doing so wouldn't push the household
 * past `limit`, as a single guarded INSERT -- the count check and the insert happen inside one
 * D1 statement, so two concurrent requests can't both read "one remaining" before either write
 * lands (the race the previous check-then-`waitUntil`-write version had: both requests would read
 * the same pre-write count and both pass). D1/SQLite serializes writes against a given database,
 * so whichever request's statement runs first commits its row before the other's COUNT subquery
 * is evaluated -- the second request's WHERE clause then sees the first's row and its insert
 * selects zero rows. Returns whether this request's row was inserted.
 *
 * Reimplements `lib/entitlements.ts`'s private `startOfTodayUtc` rather than importing it --
 * that file is out of scope for this change.
 */
const reserveDailyPick = async (
	db: Database,
	householdId: string,
	limit: number,
	id: string
): Promise<boolean> => {
	const windowStart = startOfTodayUtc();
	const result = await db.run(sql`
		insert into pick_usage (id, household_id, picked_at)
		select ${id}, ${householdId}, ${Date.now()}
		where (
			select count(*) from pick_usage
			where household_id = ${householdId} and picked_at >= ${windowStart.getTime()}
		) < ${limit}
	`);
	return result.meta.changes > 0;
};

/**
 * Rejects with 402 once the household's daily free-tier pick quota is exhausted. The pick is
 * reserved atomically with the quota check (see `reserveDailyPick`) before `next()` runs -- not
 * deferred to `waitUntil` after the response, since a deferred write can't gate concurrent
 * in-flight requests against each other. If the downstream handler doesn't actually succeed
 * (< 300), the reservation is released so a failed attempt (bad input, no candidates found) never
 * costs the household a pick, matching the previous "only record on success" behavior.
 *
 * Must run after `enforceRegionLock`; falls back to computing entitlements itself if used
 * without it.
 */
export const enforcePickQuota = createMiddleware<AppEnv>(async (c, next) => {
	const householdId = c.req.param('id');
	if (!householdId) return c.json({ error: 'household_id_required' }, 400);
	const db = createDb(c.env.DB);
	const entitlements =
		c.get('entitlements') ?? (await getEntitlements(db, householdId));

	const pickUsageId = newId('pickusage');
	const reserved = await reserveDailyPick(
		db,
		householdId,
		entitlements.dailyPickLimit,
		pickUsageId
	);
	if (!reserved) {
		return c.json(
			{
				error: 'pick_quota_exceeded',
				upgradeUrl: '/billing/mock-checkout',
				entitlements,
			},
			402
		);
	}

	const releaseReservation = () => {
		c.executionCtx.waitUntil(
			db
				.delete(pickUsage)
				.where(eq(pickUsage.id, pickUsageId))
				.catch(err => {
					console.error(
						'[entitlements] failed to release unused pick reservation',
						err
					);
				})
		);
	};

	try {
		await next();
	} catch (err) {
		releaseReservation();
		throw err;
	}
	if (c.res.status >= 300) {
		releaseReservation();
	}
});
