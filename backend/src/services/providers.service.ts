import Content, {
	type ContentProviders,
	type ProviderRegion,
} from '../models/Content';
import { fetchWatchProviders, type RegionProviders } from './tmdb.service';

interface GetProvidersOptions {
	region?: string;
	maxAgeHours?: number;
}

const DEFAULT_REGION = 'GB';
const DEFAULT_MAX_AGE_HOURS = 24;

const titleFromMediaType = (mediaType: 'movie' | 'tv'): string =>
	mediaType === 'movie' ? 'Untitled movie' : 'Untitled show';

const mediaTypeToContentType = (mediaType: 'movie' | 'tv'): 'movie' | 'show' =>
	mediaType === 'movie' ? 'movie' : 'show';

const mapTmdbList = (list: RegionProviders['flatrate']) =>
	list?.map(p => ({
		provider_id: p.provider_id,
		provider_name: p.provider_name,
		logo_path: p.logo_path ?? null,
	}));

const tmdbToStored = (region: RegionProviders): ProviderRegion => {
	const stored: ProviderRegion = {};
	const flatrate = mapTmdbList(region.flatrate);
	const rent = mapTmdbList(region.rent);
	const buy = mapTmdbList(region.buy);
	if (flatrate) stored.flatrate = flatrate;
	if (rent) stored.rent = rent;
	if (buy) stored.buy = buy;
	return stored;
};

const storedToRegion = (
	value: ContentProviders[string]
): ProviderRegion | null => {
	if (!value || typeof value === 'string') {
		return null;
	}
	return value;
};

const isStale = (
	providers: ContentProviders | null | undefined,
	maxAgeHours: number
): boolean => {
	if (!providers || !providers.last_updated_at) {
		return true;
	}
	const updatedAt = new Date(providers.last_updated_at).getTime();
	if (Number.isNaN(updatedAt)) {
		return true;
	}
	const ageMs = Date.now() - updatedAt;
	return ageMs > maxAgeHours * 60 * 60 * 1000;
};

export const refreshProvidersForContent = async (
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<void> => {
	const all = await fetchWatchProviders(tmdbId, mediaType);

	const providers: ContentProviders = {
		last_updated_at: new Date().toISOString(),
	};
	for (const [region, regional] of Object.entries(all)) {
		providers[region] = tmdbToStored(regional);
	}

	const existing = await Content.findOne({ where: { tmdb_id: tmdbId } });

	if (existing) {
		existing.providers = providers;
		existing.media_type = mediaType;
		await existing.save();
		return;
	}

	await Content.create({
		title: titleFromMediaType(mediaType),
		type: mediaTypeToContentType(mediaType),
		status: 'active',
		tmdb_id: tmdbId,
		media_type: mediaType,
		providers,
	});
};

export const getProvidersForContent = async (
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	options: GetProvidersOptions = {}
): Promise<ProviderRegion | null> => {
	const region = options.region ?? DEFAULT_REGION;
	const maxAgeHours = options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;

	const existing = await Content.findOne({ where: { tmdb_id: tmdbId } });
	const cached = existing?.providers ?? null;
	const cachedRegion = cached ? storedToRegion(cached[region]) : null;

	if (!cached || isStale(cached, maxAgeHours) || !cachedRegion) {
		await refreshProvidersForContent(tmdbId, mediaType);
		const refreshed = await Content.findOne({ where: { tmdb_id: tmdbId } });
		const next = refreshed?.providers ?? null;
		return next ? storedToRegion(next[region]) : null;
	}

	return cachedRegion;
};
