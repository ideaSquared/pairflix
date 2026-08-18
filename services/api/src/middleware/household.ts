import { createDb } from '@pairflix/db';
import { createMiddleware } from 'hono/factory';
import { isMember, isOwner } from '../lib/household';
import type { AppEnv } from '../types';

/** Gate for household-scoped routes keyed by the `:id` path param -- 403s unless the
 * authenticated user belongs to the household. Must run after `requireAuth`. Consolidates what
 * the current Express app reimplements separately per route/controller into one check. */
export const requireHouseholdMember = createMiddleware<AppEnv>(
	async (c, next) => {
		const userId = c.get('userId');
		const householdId = c.req.param('id');
		if (!householdId) return c.json({ error: 'household_id_required' }, 400);
		const db = createDb(c.env.DB);
		const member = userId ? await isMember(db, householdId, userId) : false;
		if (!member) return c.json({ error: 'not_a_household_member' }, 403);
		return next();
	}
);

/** Gate for owner-only household actions (e.g. creating invites). Must run after `requireAuth`. */
export const requireHouseholdOwner = createMiddleware<AppEnv>(
	async (c, next) => {
		const userId = c.get('userId');
		const householdId = c.req.param('id');
		if (!householdId) return c.json({ error: 'household_id_required' }, 400);
		const db = createDb(c.env.DB);
		const owner = userId ? await isOwner(db, householdId, userId) : false;
		if (!owner) return c.json({ error: 'owner_only' }, 403);
		return next();
	}
);
