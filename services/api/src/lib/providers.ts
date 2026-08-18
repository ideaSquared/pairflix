import {
	content,
	type ContentProviders,
	type Database,
	type ProviderRegion,
} from '@pairflix/db';
import { and, eq } from 'drizzle-orm';
import type { Bindings } from '../types';
import { newId } from './id';
import { getAllWatchProviders } from './tmdb';

/**
 * Read-through cache over the `content` table, ported from the current Express
 * `providers.service.ts`. One deliberate departure: it widens the cached shape to
 * flatrate/free/ads/rent/buy/link (Express's stored shape drops free/ads/link) so
 * `lib/providerLaunch.ts` can read from this same cache instead of hitting TMDb raw on every
 * launch click -- today three separate, disconnected paths all fetch watch-providers
 * independently (this cache, the pick recommender's own uncached `lib/tmdb.ts` call, and
 * Express's provider-launch, which fetched raw). Unifying providers/launch here is this
 * domain's job; leaving the recommender's hydration step as-is is a separate, lower-risk
 * follow-up not worth bundling into this change.
 *
 * Staleness is checked at the blob level (one `last_updated_at` covering every region a refresh
 * populated), matching Express -- not a correctness bug, just less precise than a per-region
 * timestamp would be, and simpler to reason about.
 */

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const DEFAULT_REGION = 'GB';

const isStale = (providers: ContentProviders, maxAgeMs: number): boolean => {
	const updatedAt = providers.last_updated_at;
	if (!updatedAt) return true;
	const updatedAtMs = new Date(updatedAt).getTime();
	if (Number.isNaN(updatedAtMs)) return true;
	return Date.now() - updatedAtMs > maxAgeMs;
};

const readRegion = (
	providers: ContentProviders | undefined,
	region: string
): ProviderRegion | null => {
	const value = providers?.[region];
	return value && typeof value === 'object' ? value : null;
};

const titleFromMediaType = (mediaType: 'movie' | 'tv'): string =>
	mediaType === 'movie' ? 'Untitled movie' : 'Untitled show';

const refreshProviders = async (
	env: Bindings,
	db: Database,
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<ContentProviders> => {
	const all = await getAllWatchProviders(env, tmdbId, mediaType);
	const providers: ContentProviders = {
		last_updated_at: new Date().toISOString(),
	};
	for (const [region, regional] of Object.entries(all)) {
		providers[region] = regional;
	}

	const now = new Date();
	await db
		.insert(content)
		.values({
			id: newId('content'),
			title: titleFromMediaType(mediaType),
			type: mediaType === 'movie' ? 'movie' : 'show',
			status: 'active',
			tmdbId,
			mediaType,
			providers,
			createdAt: now,
			updatedAt: now,
		})
		// Only providers/updatedAt change on a refresh -- title/type/status are whatever a
		// moderator or the initial cache-miss set them to, never silently overwritten (in
		// particular, this must never un-flag content a moderator already removed).
		.onConflictDoUpdate({
			target: [content.tmdbId, content.mediaType],
			set: { providers, updatedAt: now },
		});

	return providers;
};

/** Best-effort: a TMDb failure degrades to whatever's already cached (even if stale), or an
 * empty result -- never throws, matching CLAUDE.md's "provider data is best-effort... degrade
 * gracefully" and the same pattern `lib/recommendation.ts`'s hydration step already uses. */
export const getCachedProviders = async (
	env: Bindings,
	db: Database,
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	region: string = DEFAULT_REGION
): Promise<ProviderRegion> => {
	const existing = await db
		.select({ providers: content.providers })
		.from(content)
		.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, mediaType)))
		.get();

	const cachedRegion = readRegion(existing?.providers, region);
	if (
		existing?.providers &&
		!isStale(existing.providers, STALE_AFTER_MS) &&
		cachedRegion
	) {
		return cachedRegion;
	}

	try {
		const refreshed = await refreshProviders(env, db, tmdbId, mediaType);
		return readRegion(refreshed, region) ?? {};
	} catch (err) {
		console.warn(
			'[providers] refresh failed, falling back to cached/empty',
			err instanceof Error ? err.message : 'Unknown error'
		);
		return cachedRegion ?? {};
	}
};
