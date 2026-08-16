import { fetchWatchProviders } from './tmdb.service';

export interface ResolveLaunchInput {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	provider_slug: string;
	region: string;
}

export interface ResolvedLaunch {
	url: string;
	provider_name: string;
	region: string;
}

const normalize = (value: string): string =>
	value.toLowerCase().replace(/[^a-z0-9]/g, '');

export class ProviderNotAvailableError extends Error {
	constructor(slug: string, region: string) {
		super(`Provider ${slug} not available in ${region}`);
		this.name = 'ProviderNotAvailableError';
	}
}

export const resolveProviderLaunch = async (
	input: ResolveLaunchInput
): Promise<ResolvedLaunch> => {
	const region = input.region.toUpperCase();
	const wanted = normalize(input.provider_slug);

	const all = await fetchWatchProviders(input.tmdb_id, input.media_type);
	const regional = all[region];

	if (!regional) {
		throw new ProviderNotAvailableError(input.provider_slug, region);
	}

	const candidates = [
		...(regional.flatrate ?? []),
		...(regional.free ?? []),
		...(regional.ads ?? []),
		...(regional.rent ?? []),
		...(regional.buy ?? []),
	];

	const match = candidates.find(p => {
		const name = normalize(p.provider_name);
		return name === wanted || name.includes(wanted) || wanted.includes(name);
	});

	if (!match || !regional.link) {
		throw new ProviderNotAvailableError(input.provider_slug, region);
	}

	return {
		url: regional.link,
		provider_name: match.provider_name,
		region,
	};
};
