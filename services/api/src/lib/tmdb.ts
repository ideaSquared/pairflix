import type { Bindings } from '../types';

/**
 * TMDb client -- fetch-based (Workers-native, no SDK). Ported from the current Express
 * `tmdb.service.ts`; deliberately dropped its in-memory `Map`-based watch-providers cache since a
 * per-isolate cache doesn't reliably persist across requests on Workers anyway. `discoverMedia` is
 * edge-cached (see `DISCOVER_CACHE_TTL_SECONDS` below); watch-providers stays uncached at this raw
 * layer -- `lib/providers.ts`'s `content`-table read-through cache is the caching layer for
 * provider data, built on top of `getAllWatchProviders` below, and callers should read through it
 * rather than duplicating a second cache here. `getMovieFullDetails`/`getTVFullDetails` (used by
 * the recommender's candidate scan, which needs fresh runtime/genre data every call) are left
 * uncached.
 */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const SAFE_ENDPOINT = /^\/[a-z][a-z_]*(?:\/[a-z0-9_]+)*$/;
const REQUEST_TIMEOUT_MS = 6_000;
// Popularity-sorted /discover results shift slowly enough that an hour-old page is still a
// reasonable answer, and this is the one TMDb call every pick makes at least once -- caching it is
// what actually keeps a busy pick path under the Workers subrequest cap (see recommendation.ts).
const DISCOVER_CACHE_TTL_SECONDS = 60 * 60;

/** Base class for every typed TMDb failure -- `statusCode` lets a caller (or a future Hono
 * `onError` translator) map it to a response without string-matching `message`. */
export class TMDbError extends Error {
	readonly statusCode: number;
	constructor(message: string, statusCode: number) {
		super(message);
		this.name = 'TMDbError';
		this.statusCode = statusCode;
	}
}

export class TMDbConfigError extends TMDbError {
	constructor() {
		super('TMDB_API_KEY is not set', 500);
		this.name = 'TMDbConfigError';
	}
}

export class TMDbRateLimitError extends TMDbError {
	constructor() {
		super('TMDb rate limit exceeded', 429);
		this.name = 'TMDbRateLimitError';
	}
}

export class TMDbServerError extends TMDbError {
	constructor(status: number) {
		super(`TMDb server error: ${status}`, 502);
		this.name = 'TMDbServerError';
	}
}

export class TMDbRequestError extends TMDbError {
	constructor(status: number, statusText: string) {
		super(`TMDb API error: ${status} ${statusText}`, 502);
		this.name = 'TMDbRequestError';
	}
}

const fetchWithTimeout = async (url: string): Promise<Response> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		return await fetch(url, { signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
};

const tmdbFetch = async <T>(
	env: Bindings,
	endpoint: string,
	params: Record<string, string> = {},
	opts: { retryOnTransient?: boolean } = {}
): Promise<T> => {
	// Allowlist the endpoint path so a caller can never construct a URL that escapes the TMDb
	// origin. Query parameters are still URL-encoded below.
	if (!SAFE_ENDPOINT.test(endpoint)) {
		throw new Error(`Invalid TMDb endpoint: ${endpoint}`);
	}
	if (!env.TMDB_API_KEY) {
		throw new TMDbConfigError();
	}

	const searchParams = new URLSearchParams({
		api_key: env.TMDB_API_KEY,
		...params,
	});
	const url = `${TMDB_BASE_URL}${endpoint}?${searchParams}`;

	let response = await fetchWithTimeout(url);
	// A single retry for transient failures -- only `discoverMedia` opts in, since it's the one
	// call a pick can't proceed without at all. Hydration's per-candidate detail/provider calls stay
	// single-attempt so a rate-limited window can't multiply the already-bounded subrequest count
	// they carry per pick (see recommendation.ts's MAX_HYDRATE_ATTEMPTS).
	if (
		opts.retryOnTransient &&
		!response.ok &&
		(response.status === 429 || response.status >= 500)
	) {
		response = await fetchWithTimeout(url);
	}

	if (!response.ok) {
		if (response.status === 429) throw new TMDbRateLimitError();
		if (response.status >= 500) throw new TMDbServerError(response.status);
		throw new TMDbRequestError(response.status, response.statusText);
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

/** Cache key deliberately excludes `api_key` (only ever the same key for this Worker, and it has
 * no business being part of a cache key) and uses an internal host -- the Cache API keys on the
 * full request URL, not just the path+query. */
const discoverCacheKey = (
	mediaType: 'movie' | 'tv',
	params: Record<string, string>
): Request =>
	new Request(
		`https://tmdb-cache.internal/discover/${mediaType}?${new URLSearchParams(params)}`
	);

export const discoverMedia = async (
	env: Bindings,
	params: TMDbDiscoverParams
): Promise<TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>> => {
	const queryParams: Record<string, string> = {
		// `|` is TMDb's OR join for with_genres -- a comma means AND (the title must carry every
		// listed genre at once). Callers here build `genres` as a preference set (mood genres unioned
		// with the household's top taste genres, see `topMergedGenres`), and `scoreCandidate` scores a
		// title on however many of those genres it happens to overlap -- it was never meant to require
		// all of them simultaneously, which for a household with a few taste ratings on top of a
		// two-genre mood routinely produces zero real titles and surfaces as `NoCandidatesError`.
		with_genres: params.genres.join('|'),
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

	// Only cache in production -- `wrangler dev`/tests stub or expect fresh TMDb responses per call,
	// and the Cache API has no per-test reset the way this Worker's D1 binding does.
	const cacheEnabled = env.ENVIRONMENT === 'production';
	const cacheKey = cacheEnabled
		? discoverCacheKey(params.mediaType, queryParams)
		: null;
	if (cacheKey) {
		const cached = await caches.default.match(cacheKey).catch(() => undefined);
		if (cached) {
			return cached.json() as Promise<
				TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>
			>;
		}
	}

	const result = await tmdbFetch<
		TMDbResponse<TMDbDiscoverMovie | TMDbDiscoverTV>
	>(env, `/discover/${params.mediaType}`, queryParams, {
		retryOnTransient: true,
	});

	if (cacheKey) {
		await caches.default
			.put(
				cacheKey,
				new Response(JSON.stringify(result), {
					headers: {
						'content-type': 'application/json',
						'cache-control': `max-age=${DISCOVER_CACHE_TTL_SECONDS}`,
					},
				})
			)
			.catch(() => undefined);
	}

	return result;
};

export type TMDbMovieFull = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	runtime?: number | null;
	release_date?: string;
	genres?: { id: number; name: string }[];
};

export type TMDbTVFull = {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	episode_run_time?: number[];
	first_air_date?: string;
	genres?: { id: number; name: string }[];
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
	// `string | null`, not just `string` -- matches `@pairflix/db`'s stored `ProviderEntry` shape
	// so a `RegionProviders` read back through lib/providers.ts's D1 cache (see recommendation.ts's
	// `hydrate`) structurally fits this type without a cast.
	logo_path: string | null;
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
