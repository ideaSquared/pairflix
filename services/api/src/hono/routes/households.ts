import { createDb } from '@pairflix/db';
import {
	CommitPickRequestSchema,
	CreateHouseholdRequestSchema,
	CreateInviteRequestSchema,
	PickRequestSchema,
	type PickRequest,
} from '@pairflix/lib.validation';
import { Hono } from 'hono';
import {
	InviteInvalidError,
	acceptInvite,
	createForOwner,
	createInvite,
	listForUser,
} from '../lib/household';
import { recordPickEvent } from '../lib/pickEvents';
import {
	HouseholdNotFoundError,
	NoCandidatesError,
	commitPick,
	pickForHousehold,
} from '../lib/recommendation';
import {
	enforcePickQuota,
	enforceRegionLock,
} from '../middleware/entitlements';
import { requireAuth } from '../middleware/auth';
import {
	requireHouseholdMember,
	requireHouseholdOwner,
} from '../middleware/household';
import type { AppEnv } from '../types';

/**
 * Covers what the current Express `household.routes.ts` mounts under `/api/households` (CRUD,
 * invites, pick, commit) minus what belongs to a later roadmap phase: provider-launch tracking
 * and pick-event stats (providers/history), `GET /:id/entitlements` (billing/admin). Also mounts
 * accept-invite, which exists in Express (`householdInvites.routes.ts`) but is never actually
 * registered on the app router there -- without it, an invite can be created but never accepted.
 */
export const householdsRoutes = new Hono<AppEnv>();

householdsRoutes.use('*', requireAuth);

householdsRoutes.get('/', async c => {
	const userId = c.get('userId') as string;
	const db = createDb(c.env.DB);
	const households = await listForUser(db, userId);
	return c.json({ households });
});

householdsRoutes.post('/', async c => {
	const userId = c.get('userId') as string;
	const parsed = CreateHouseholdRequestSchema.safeParse(
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
	const household = await createForOwner(db, userId, parsed.data.name || null);
	return c.json({ household }, 201);
});

householdsRoutes.post('/:id/invites', requireHouseholdOwner, async c => {
	const householdId = c.req.param('id');
	const userId = c.get('userId') as string;
	const parsed = CreateInviteRequestSchema.safeParse(
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
	const invite = await createInvite(
		db,
		householdId,
		userId,
		parsed.data.email ?? null
	);
	return c.json({ invite }, 201);
});

householdsRoutes.post('/invites/:token/accept', async c => {
	const userId = c.get('userId') as string;
	const token = c.req.param('token');
	const db = createDb(c.env.DB);
	try {
		const result = await acceptInvite(db, token, userId);
		return c.json(result);
	} catch (error) {
		if (error instanceof InviteInvalidError) {
			return c.json({ error: 'invite_invalid_or_expired' }, 410);
		}
		throw error;
	}
});

householdsRoutes.post(
	'/:id/pick',
	requireHouseholdMember,
	enforceRegionLock,
	enforcePickQuota,
	async c => {
		const householdId = c.req.param('id');
		const userId = c.get('userId') as string;
		const parsed = PickRequestSchema.safeParse(
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

		// Free-tier households get their region silently overridden -- see enforceRegionLock.
		const entitlements = c.get('entitlements');
		const request: PickRequest = {
			...parsed.data,
			...(entitlements?.regionLock ? { region: entitlements.regionLock } : {}),
		};

		const db = createDb(c.env.DB);
		try {
			const result = await pickForHousehold(c.env, db, householdId, request);
			c.executionCtx.waitUntil(
				recordPickEvent(db, {
					householdId,
					userId,
					tmdbId: result.pick.tmdbId,
					mediaType: result.pick.mediaType,
					kind: 'proposed',
					mood: request.mood,
					minutesBudget: request.minutes,
					region: request.region ?? null,
				}).catch(err => {
					console.warn(
						'[households] failed to record proposed pick event',
						err
					);
				})
			);
			return c.json(result);
		} catch (error) {
			if (
				error instanceof HouseholdNotFoundError ||
				error instanceof NoCandidatesError
			) {
				return c.json({ error: error.message }, 404);
			}
			throw error;
		}
	}
);

householdsRoutes.post(
	'/:id/picks/:tmdbId/commit',
	requireHouseholdMember,
	async c => {
		const householdId = c.req.param('id');
		const userId = c.get('userId') as string;
		const tmdbId = Number.parseInt(c.req.param('tmdbId'), 10);
		if (Number.isNaN(tmdbId)) {
			return c.json({ error: 'Invalid tmdbId' }, 400);
		}

		const parsed = CommitPickRequestSchema.safeParse(
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
		const result = await commitPick(
			db,
			householdId,
			userId,
			tmdbId,
			parsed.data
		);
		return c.json({ recorded: true, id: result.id }, 201);
	}
);
