import { createDb } from '@pairflix/db';
import {
	CommitPickRequestSchema,
	CreateHouseholdRequestSchema,
	CreateInviteRequestSchema,
	HistoryPatchRequestSchema,
	HistoryQuerySchema,
	PickEventRequestSchema,
	PickEventStatsQuerySchema,
	PickRequestSchema,
	ProviderLaunchRequestSchema,
	type Mood,
	type PickRequest,
} from '@pairflix/lib.validation';
import { Hono } from 'hono';
import {
	cancelSubscription,
	isBillingMockEnabled,
	mockActivatePremium,
	startCheckout,
} from '../lib/billing';
import { getEntitlements } from '../lib/entitlements';
import { listHistory, setEnjoyed } from '../lib/history';
import {
	InviteInvalidError,
	acceptInvite,
	createForOwner,
	createInvite,
	listForUser,
} from '../lib/household';
import { recordPickEvent } from '../lib/pickEvents';
import { getPickEventStats } from '../lib/pickEventStats';
import {
	ProviderNotAvailableError,
	resolveProviderLaunch,
} from '../lib/providerLaunch';
import {
	HouseholdNotFoundError,
	NoCandidatesError,
	commitPick,
	pickForHousehold,
} from '../lib/recommendation';
import { recomputeTasteFromRating } from '../lib/tasteRecompute';
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
 * invites, pick, commit, provider-launch, pick-events) plus `history.routes.ts`'s two routes and
 * `billing.routes.ts`'s household-scoped entitlements/checkout/cancel/mock-activate (the flat
 * `/api/billing/*` + body `household_id` shape in Express becomes `/:id/billing/*`, matching every
 * other household-scoped route here and reusing `requireHouseholdOwner` instead of Express's own
 * per-handler owner check). Also mounts accept-invite, which exists in Express
 * (`householdInvites.routes.ts`) but is never actually registered on the app router there --
 * without it, an invite can be created but never accepted.
 *
 * `/:id/history` and `/:id/picks/:tmdbId/launch` both run `enforceRegionLock` even though neither
 * is the pick endpoint -- they're the other two places a caller picks which region's provider data
 * to see, so the same free-tier GB-lock applies. The standalone `GET /api/providers/:tmdbId`
 * used to be a third, ungated place -- deleted rather than fixed, since it had no callers anywhere
 * in the codebase; see docs/roadmap.md.
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
			c.env,
			db,
			householdId,
			userId,
			tmdbId,
			parsed.data
		);
		return c.json({ recorded: true, id: result.id }, 201);
	}
);

householdsRoutes.get(
	'/:id/history',
	requireHouseholdMember,
	enforceRegionLock,
	async c => {
		const householdId = c.req.param('id');
		const parsed = HistoryQuerySchema.safeParse(c.req.query());
		if (!parsed.success) {
			return c.json(
				{
					error: 'Invalid input',
					details: parsed.error.issues.map(i => i.message),
				},
				400
			);
		}

		const entitlements = c.get('entitlements');
		const region = entitlements?.regionLock ?? parsed.data.region ?? 'GB';

		const db = createDb(c.env.DB);
		const result = await listHistory(
			db,
			householdId,
			parsed.data.page,
			parsed.data.limit,
			region
		);
		return c.json(result);
	}
);

householdsRoutes.patch(
	'/:id/history/:watchedId',
	requireHouseholdMember,
	enforceRegionLock,
	async c => {
		const householdId = c.req.param('id');
		const watchedId = c.req.param('watchedId');
		const parsed = HistoryPatchRequestSchema.safeParse(
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

		const entitlements = c.get('entitlements');
		const region = entitlements?.regionLock ?? 'GB';

		const db = createDb(c.env.DB);
		const entry = await setEnjoyed(
			db,
			householdId,
			watchedId,
			parsed.data.enjoyed,
			region
		);
		if (!entry) return c.json({ error: 'Not found' }, 404);

		if (parsed.data.enjoyed !== null) {
			c.executionCtx.waitUntil(
				recomputeTasteFromRating(
					c.env,
					db,
					householdId,
					entry.tmdbId,
					entry.mediaType,
					parsed.data.enjoyed,
					// entry.moodAtPick only ever comes from a validated MoodSchema value written at
					// commit time (CommitPickRequestSchema.mood) -- the column itself is unconstrained
					// text so the type here is widened, but every writer already narrowed it.
					entry.moodAtPick as Mood | null
				).catch(err => {
					console.warn('[households] failed to recompute taste profile', err);
				})
			);
		}
		return c.json({ entry });
	}
);

householdsRoutes.post(
	'/:id/picks/:tmdbId/launch',
	requireHouseholdMember,
	enforceRegionLock,
	async c => {
		const householdId = c.req.param('id');
		const userId = c.get('userId') as string;
		const tmdbId = Number.parseInt(c.req.param('tmdbId'), 10);
		if (Number.isNaN(tmdbId)) {
			return c.json({ error: 'Invalid tmdbId' }, 400);
		}

		const parsed = ProviderLaunchRequestSchema.safeParse(
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

		const entitlements = c.get('entitlements');
		const region = entitlements?.regionLock ?? parsed.data.region ?? 'GB';

		const db = createDb(c.env.DB);
		try {
			const resolved = await resolveProviderLaunch(
				c.env,
				db,
				tmdbId,
				parsed.data.mediaType,
				parsed.data.providerSlug,
				region
			);
			c.executionCtx.waitUntil(
				recordPickEvent(db, {
					householdId,
					userId,
					tmdbId,
					mediaType: parsed.data.mediaType,
					kind: 'provider_launched',
					providerSlug: parsed.data.providerSlug,
					region,
				}).catch(err => {
					console.warn(
						'[households] failed to record provider_launched pick event',
						err
					);
				})
			);
			return c.json(resolved);
		} catch (error) {
			if (error instanceof ProviderNotAvailableError) {
				return c.json({ error: 'provider_not_available' }, 404);
			}
			throw error;
		}
	}
);

householdsRoutes.post('/:id/pick-events', requireHouseholdMember, async c => {
	const householdId = c.req.param('id');
	const userId = c.get('userId') as string;
	const parsed = PickEventRequestSchema.safeParse(
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
	const result = await recordPickEvent(db, {
		householdId,
		userId,
		tmdbId: parsed.data.tmdbId,
		mediaType: parsed.data.mediaType,
		kind: parsed.data.kind,
		mood: parsed.data.mood,
		minutesBudget: parsed.data.minutesBudget,
	});
	return c.json({ recorded: true, id: result.id }, 201);
});

householdsRoutes.get(
	'/:id/pick-events/stats',
	requireHouseholdMember,
	async c => {
		const householdId = c.req.param('id');
		const parsed = PickEventStatsQuerySchema.safeParse(c.req.query());
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
		const stats = await getPickEventStats(
			db,
			householdId,
			parsed.data.windowDays
		);
		return c.json(stats);
	}
);

householdsRoutes.get('/:id/entitlements', requireHouseholdMember, async c => {
	const householdId = c.req.param('id');
	const db = createDb(c.env.DB);
	const entitlements = await getEntitlements(db, householdId);
	return c.json(entitlements);
});

householdsRoutes.post('/:id/billing/checkout', requireHouseholdOwner, c => {
	const householdId = c.req.param('id');
	return c.json(startCheckout(householdId));
});

householdsRoutes.post('/:id/billing/cancel', requireHouseholdOwner, async c => {
	const householdId = c.req.param('id');
	const db = createDb(c.env.DB);
	await cancelSubscription(db, householdId);
	return c.body(null, 204);
});

/**
 * Pretends not to exist (404) when the mock is disabled, matching Express's
 * `isBillingMockEnabled()` gate -- there's no real Stripe integration behind this route, so it
 * shouldn't be discoverable outside dev/demo use.
 */
householdsRoutes.post(
	'/:id/billing/mock-activate',
	requireHouseholdOwner,
	async c => {
		if (!isBillingMockEnabled(c.env))
			return c.json({ error: 'not_found' }, 404);
		const householdId = c.req.param('id');
		const db = createDb(c.env.DB);
		await mockActivatePremium(db, householdId);
		return c.json({ ok: true });
	}
);
