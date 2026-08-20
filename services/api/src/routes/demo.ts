import { PickRequestSchema, type PickRequest } from '@pairflix/lib.validation';
import { Hono } from 'hono';
import { NoCandidatesError, pickForAnonymous } from '../lib/recommendation';
import { ipRateLimit } from '../middleware/ip-rate-limit';
import type { AppEnv } from '../types';

/**
 * Public, unauthenticated pick endpoint for the landing page's one-time demo -- deliberately its
 * own router rather than a route on `householdsRoutes`, since that router applies `requireAuth`
 * to everything mounted on it (`households.ts` line 74). No such gate is added here.
 *
 * "One time" is enforced in two layers: the client hides the form after a successful pick
 * (`apps/client`'s `useDemoPickGate`), and this route's `demoPickRateLimit` is the abuse
 * backstop for scripted/repeated calls. `limit: 3` rather than `1` -- a hard per-visitor cap
 * would also 429 a second household member on the same IP the moment the first one tries it.
 */
export const demoRoutes = new Hono<AppEnv>();

const demoPickRateLimit = ipRateLimit({
	routeName: 'demo-pick',
	limit: 3,
	windowMinutes: 1440,
});

demoRoutes.post('/pick', demoPickRateLimit, async c => {
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

	// Cloudflare's edge geo, not the caller-supplied region -- same reasoning as the free-tier
	// `enforceRegionLock` (households.ts line 167): deterministic and not client-controllable.
	// 'T1' is Cloudflare's "Tor exit node" placeholder, not a real country. Falls through to
	// `undefined` (and from there to buildRecommendation's own 'GB' default) when `cf` is absent,
	// which only happens outside the real Cloudflare edge (local `wrangler dev`).
	const geoCountry = c.req.raw.cf?.country;
	const region: string | undefined =
		typeof geoCountry === 'string' && geoCountry !== 'T1'
			? geoCountry
			: undefined;
	const request: PickRequest = {
		...parsed.data,
		...(region ? { region } : {}),
	};

	try {
		const result = await pickForAnonymous(c.env, request);
		return c.json(result);
	} catch (error) {
		if (error instanceof NoCandidatesError) {
			return c.json({ error: error.message }, 404);
		}
		throw error;
	}
});
