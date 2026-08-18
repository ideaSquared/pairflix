import type { Bindings } from '../types';

/**
 * TMDb client -- fetch-based (Workers-native, no SDK). Ported from the current Express
 * `tmdb.service.ts`; deliberately dropped its in-memory `Map`-based watch-providers cache since a
 * per-isolate cache doesn't reliably persist across requests on Workers anyway. Everything in this
 * file is an uncached, direct-to-TMDb primitive; `lib/providers.ts`'s `content`-table read-through
 * cache is the Workers-appropriate replacement, built on top of `getAllWatchProviders` below --
 * `discoverMedia`/`getMovieFullDetails`/`getTVFullDetails` (used by the recommender's candidate
 * scan, which needs fresh results every call) are left uncached.
 */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const SAFE_ENDPOINT = /^\/[a-z][a-z_]*(?:\/[a-z0-9_]+)*$/;

const tmdbFetch = async <T>(
	env: Bindings,
	endpoint: string,
	params: Record<string, string> = {}
): Promise<T> => {
	// Allowlist the endpoint path so a caller can never construct a URL that escapes the TMDb
	// origin. Query parameters are still URL-encoded below.
	if (!SAFE_ENDPOINT.test(endpoint)) {
		throw new Error(`Invalid TMDb endpoint: ${endpoint}`);
	}

	const searchParams = new URLSearchParams({
		api_key: env.TMDB_API_KEY ?? '',
		...params,
	});

	const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
	if (!response.ok) {
		throw new Error(
			`TMDb API error: ${response.status} ${response.statusText}`
		);
	}
	// External API response, not runtime-validated -- callers only read the handful of fields
	// their own TMDb*/RegionProviders types declare.
	return response.json() as Promise<T>;
};

export type TMDbResponse<T> = { results?: T[]; status_message?: string };

export type TMDbDiscoverMovie = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date?: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	popularity: number;
};

export type TMDbDiscoverTV = {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	first_air_date?: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	popularity: number;
};

export type TMDbDiscoverParams = {
	mediaType: 'movie' | 'tv';
	genres: number[];
	withRuntimeLte?: number;
	voteCountGte?: number;
	region?: string;
	page?: number;
	sortBy?: string;
};

export const discoverMedia = async (
	env: Bindings,
	params: TMDbDiscoverParams
): Promise<TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>> => {
	const queryParams: Record<string, string> = {
		with_genres: params.genres.join(','),
		'vote_count.gte': (params.voteCountGte ?? 200).toString(),
		sort_by: params.sortBy ?? 'popularity.desc',
		page: (params.page ?? 1).toString(),
		include_adult: 'false',
	};
	if (params.withRuntimeLte && params.mediaType === 'movie') {
		queryParams['with_runtime.lte'] = params.withRuntimeLte.toString();
	}
	if (params.region) {
		queryParams.region = params.region;
		queryParams.watch_region = params.region;
	}

	return tmdbFetch<TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>>(
		env,
		`/discover/${params.mediaType}`,
		queryParams
	);
};

export type TMDbMovieFull = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	runtime?: number | null;
	release_date?: string;
};

export type TMDbTVFull = {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	episode_run_time?: number[];
	first_air_date?: string;
};

export const getMovieFullDetails = (
	env: Bindings,
	movieId: number
): Promise<TMDbMovieFull> => tmdbFetch<TMDbMovieFull>(env, `/movie/${movieId}`);

export const getTVFullDetails = (
	env: Bindings,
	tvId: number
): Promise<TMDbTVFull> => tmdbFetch<TMDbTVFull>(env, `/tv/${tvId}`);

export type TMDbProvider = {
	provider_id: number;
	provider_name: string;
	logo_path: string;
	display_priority?: number;
};

export type RegionProviders = {
	link?: string;
	flatrate?: TMDbProvider[];
	free?: TMDbProvider[];
	ads?: TMDbProvider[];
	buy?: TMDbProvider[];
	rent?: TMDbProvider[];
};

type WatchProvidersResponse = {
	id?: number;
	results?: Record<string, RegionProviders>;
};

export const getAllWatchProviders = async (
	env: Bindings,
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<Record<string, RegionProviders>> => {
	const data = await tmdbFetch<WatchProvidersResponse>(
		env,
		`/${mediaType}/${tmdbId}/watch/providers`
	);
	return data.results ?? {};
};

export const getWatchProviders = async (
	env: Bindings,
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	region: string
): Promise<RegionProviders> => {
	const all = await getAllWatchProviders(env, tmdbId, mediaType);
	return all[region] ?? {};
};
