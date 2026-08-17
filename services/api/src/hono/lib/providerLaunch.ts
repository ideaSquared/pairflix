import type { Database } from '@pairflix/db';
import type { Bindings } from '../types';
import { getCachedProviders } from './providers';

/**
 * Ported from Express's `providerLaunch.service.ts`. Reads through `lib/providers.ts`'s cache
 * instead of hitting TMDb raw on every launch click, unlike the Express version it replaces.
 * `regional.link` is TMDb's own "watch this title" page for the title+region (sourced from
 * JustWatch) -- not a per-provider deep link, so there's no per-provider URL to construct here.
 */

const normalize = (value: string): string =>
	value.toLowerCase().replace(/[^a-z0-9]/g, '');

export class ProviderNotAvailableError extends Error {
	constructor(providerSlug: string, region: string) {
		super(`Provider ${providerSlug} not available in ${region}`);
		this.name = 'ProviderNotAvailableError';
	}
}

export type ResolvedLaunch = {
	url: string;
	providerName: string;
	region: string;
};

export const resolveProviderLaunch = async (
	env: Bindings,
	db: Database,
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	providerSlug: string,
	region: string
): Promise<ResolvedLaunch> => {
	const wanted = normalize(providerSlug);
	const regional = await getCachedProviders(env, db, tmdbId, mediaType, region);

	const candidates = [
		...(regional.flatrate ?? []),
		...(regional.free ?? []),
		...(regional.ads ?? []),
		...(regional.rent ?? []),
		...(regional.buy ?? []),
	];

	const match = candidates.find(p => {
		const normalized = normalize(p.provider_name);
		return (
			normalized === wanted ||
			normalized.includes(wanted) ||
			wanted.includes(normalized)
		);
	});

	if (!match || !regional.link) {
		throw new ProviderNotAvailableError(providerSlug, region);
	}

	return { url: regional.link, providerName: match.provider_name, region };
};
