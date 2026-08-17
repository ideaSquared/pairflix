import { createDb } from '@pairflix/db';
import { createMiddleware } from 'hono/factory';
import { getEntitlements, recordPick } from '../lib/entitlements';
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

/**
 * Rejects with 402 once the household's daily free-tier pick quota is exhausted. On a
 * successful (< 300) response, records the pick usage via `waitUntil` so the bookkeeping write
 * doesn't hold up the response.
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

	if (entitlements.picksRemaining <= 0) {
		return c.json(
			{
				error: 'pick_quota_exceeded',
				upgradeUrl: '/billing/mock-checkout',
				entitlements,
			},
			402
		);
	}

	await next();

	if (c.res.status < 300) {
		c.executionCtx.waitUntil(
			recordPick(db, householdId).catch(err => {
				console.error('[entitlements] failed to record pick usage', err);
			})
		);
	}
});
