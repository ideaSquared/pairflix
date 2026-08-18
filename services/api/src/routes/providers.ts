import { createDb } from '@pairflix/db';
import { ProvidersQuerySchema } from '@pairflix/lib.validation';
import { Hono } from 'hono';
import { getCachedProviders } from '../lib/providers';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

/**
 * Standalone provider lookup by TMDb id -- not household-scoped (matching the Express endpoint
 * this replaces), so it can't apply a household's entitlements the way `/households/:id/pick` and
 * `/households/:id/history` do. Known, deliberately deferred gap: a free-tier caller can request
 * any region here even though those two household-scoped paths restrict them to GB -- closing it
 * needs a product decision on how a caller's entitlement should resolve with no household context
 * (which household, if the caller belongs to more than one?). See docs/roadmap.md.
 */
export const providersRoutes = new Hono<AppEnv>();

providersRoutes.use('*', requireAuth);

providersRoutes.get('/:tmdbId', async c => {
	const tmdbId = Number.parseInt(c.req.param('tmdbId'), 10);
	if (Number.isNaN(tmdbId)) {
		return c.json({ error: 'Invalid tmdbId' }, 400);
	}

	const parsed = ProvidersQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}

	const region = parsed.data.region ?? 'GB';
	const db = createDb(c.env.DB);
	const providers = await getCachedProviders(
		c.env,
		db,
		tmdbId,
		parsed.data.mediaType,
		region
	);
	return c.json({ region, providers });
});
