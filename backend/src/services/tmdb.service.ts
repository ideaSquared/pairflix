import * as dotenv from 'dotenv';

dotenv.config();

const { TMDB_API_KEY } = process.env;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDbResponse<T> {
	results?: T[];
	status_message?: string;
}

export interface TMDbGenre {
	id: number;
	name: string;
}

export interface TMDbMovie {
	id: number;
	title: string;
	poster_path: string | null;
	overview: string;
	status: string;
	genres?: TMDbGenre[];
	runtime?: number | null;
	release_date?: string;
}

export interface TMDbTV {
	id: number;
	name: string;
	poster_path: string | null;
	overview: string;
	status: string;
	genres?: TMDbGenre[];
	episode_run_time?: number[];
	first_air_date?: string;
}

export type TMDbDetails = TMDbMovie | TMDbTV;

async function tmdbFetch<T>(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<T> {
	const searchParams = new URLSearchParams({
		api_key: TMDB_API_KEY ?? '',
		...params,
	});

	const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);

	if (!response.ok) {
		throw new Error(
			`TMDb API error: ${response.status} ${response.statusText}`
		);
	}

	return response.json() as Promise<T>;
}

export async function searchMedia(query: string, page: number = 1) {
	return tmdbFetch<TMDbResponse<TMDbMovie | TMDbTV>>('/search/multi', {
		query,
		page: page.toString(),
	});
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovie> {
	return tmdbFetch<TMDbMovie>(`/movie/${movieId}`);
}

export async function getTVDetails(tvId: number): Promise<TMDbTV> {
	return tmdbFetch<TMDbTV>(`/tv/${tvId}`);
}

export async function getPopular(mediaType: 'movie' | 'tv', page: number = 1) {
	return tmdbFetch<TMDbResponse<TMDbMovie | TMDbTV>>(`/${mediaType}/popular`, {
		page: page.toString(),
	});
}

export interface TMDbDiscoverMovie {
	id: number;
	title: string;
	original_title?: string;
	overview: string;
	poster_path: string | null;
	release_date?: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	popularity: number;
}

export interface TMDbDiscoverTV {
	id: number;
	name: string;
	original_name?: string;
	overview: string;
	poster_path: string | null;
	first_air_date?: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	popularity: number;
}

export interface TMDbDiscoverParams {
	mediaType: 'movie' | 'tv';
	genres: number[];
	withRuntimeLte?: number;
	voteCountGte?: number;
	region?: string;
	page?: number;
	sortBy?: string;
}

export async function discoverMedia(
	params: TMDbDiscoverParams
): Promise<TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>> {
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
		`/discover/${params.mediaType}`,
		queryParams
	);
}

interface ProviderEntryRaw {
	provider_id: number;
	provider_name: string;
	logo_path?: string;
}

interface RegionProviders {
	flatrate?: ProviderEntryRaw[];
	free?: ProviderEntryRaw[];
	ads?: ProviderEntryRaw[];
	buy?: ProviderEntryRaw[];
	rent?: ProviderEntryRaw[];
}

export interface TMDbWatchProvidersResponse {
	id?: number;
	results?: Record<string, RegionProviders>;
}

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

const watchProvidersCache = new Map<string, CacheEntry<RegionProviders>>();
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function getWatchProviders(
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	region: string = 'GB'
): Promise<RegionProviders> {
	const cacheKey = `${tmdbId}:${mediaType}:${region}`;
	const cached = watchProvidersCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.value;
	}

	const response = await tmdbFetch<TMDbWatchProvidersResponse>(
		`/${mediaType}/${tmdbId}/watch/providers`
	);
	const regional = response.results?.[region] ?? {};
	watchProvidersCache.set(cacheKey, {
		value: regional,
		expiresAt: Date.now() + TWENTY_FOUR_HOURS_MS,
	});
	return regional;
}

export interface TMDbMovieFull extends TMDbMovie {
	runtime?: number | null;
	release_date?: string;
	genres?: { id: number; name: string }[];
	vote_average?: number;
	vote_count?: number;
}

export interface TMDbTVFull extends TMDbTV {
	episode_run_time?: number[];
	first_air_date?: string;
	genres?: { id: number; name: string }[];
	vote_average?: number;
	vote_count?: number;
}

export async function getMovieFullDetails(
	movieId: number
): Promise<TMDbMovieFull> {
	return tmdbFetch<TMDbMovieFull>(`/movie/${movieId}`);
}

export async function getTVFullDetails(tvId: number): Promise<TMDbTVFull> {
	return tmdbFetch<TMDbTVFull>(`/tv/${tvId}`);
}
