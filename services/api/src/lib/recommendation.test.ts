import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NoCandidatesError, pickForAnonymous } from './recommendation';

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
	vi.restoreAllMocks();
});

const jsonResponse = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

type StubMovie = {
	id: number;
	title: string;
	voteAverage: number;
	netflix?: boolean;
};

/** Every movie shares genre/runtime/release-year so `scoreCandidate` ranks them purely by
 * `voteAverage` (its tie-break once genre/mood/era all score identically) -- rank N in the request
 * is exactly index N-1 of `movies`, which is what the widening-cap tests below depend on. */
const stubFetch = (movies: StubMovie[]): ReturnType<typeof vi.fn> =>
	vi.fn(async (input: RequestInfo | URL) => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: input.url;
		const { pathname } = new URL(url);

		if (pathname === '/3/discover/movie') {
			return jsonResponse({
				results: movies.map(m => ({
					id: m.id,
					title: m.title,
					overview: 'overview',
					poster_path: null,
					release_date: '2020-01-01',
					vote_average: m.voteAverage,
					vote_count: 500,
					genre_ids: [35],
					popularity: m.voteAverage,
				})),
			});
		}
		if (pathname === '/3/discover/tv') {
			return jsonResponse({ results: [] });
		}
		const movieDetail = /^\/3\/movie\/(\d+)$/.exec(pathname);
		if (movieDetail) {
			const movie = movies.find(m => m.id === Number(movieDetail[1]));
			return jsonResponse({
				id: movie?.id,
				title: movie?.title,
				overview: 'overview',
				poster_path: null,
				runtime: 100,
				release_date: '2020-01-01',
				genres: [{ id: 35, name: 'comedy' }],
			});
		}
		const providers = /^\/3\/movie\/(\d+)\/watch\/providers$/.exec(pathname);
		if (providers) {
			const movie = movies.find(m => m.id === Number(providers[1]));
			return jsonResponse({
				results: movie?.netflix
					? {
							GB: {
								flatrate: [
									{
										provider_id: 8,
										provider_name: 'Netflix',
										logo_path: '/x.jpg',
									},
								],
							},
						}
					: {},
			});
		}
		return jsonResponse({}, 404);
	});

const makeMovies = (count: number, netflixAt: number): StubMovie[] =>
	Array.from({ length: count }, (_, i) => ({
		id: 9000 + i,
		title: `Movie ${i}`,
		// Strictly decreasing so vote_average alone determines rank order (index i == rank i+1).
		voteAverage: 10 - i * 0.01,
		netflix: i === netflixAt,
	}));

describe('pickForAnonymous provider-filter widening cap', () => {
	it('still finds a provider match within the widening cap (rank 18 of 25)', async () => {
		globalThis.fetch = stubFetch(makeMovies(25, 17));

		const result = await pickForAnonymous(env, {
			mood: 'funny',
			minutes: 120,
			providers: ['Netflix'],
		});

		expect(result.pick.tmdbId).toBe(9000 + 17);
	});

	it('gives up once the widening cap is exhausted (rank 25 of 25) instead of scanning the whole pool', async () => {
		globalThis.fetch = stubFetch(makeMovies(25, 24));

		await expect(
			pickForAnonymous(env, {
				mood: 'funny',
				minutes: 120,
				providers: ['Netflix'],
			})
		).rejects.toBeInstanceOf(NoCandidatesError);
	});
});

describe('pickForAnonymous provider filter normalization', () => {
	it('a garbage provider name matches nothing, not every candidate', async () => {
		globalThis.fetch = stubFetch(makeMovies(3, 1));

		await expect(
			pickForAnonymous(env, {
				mood: 'funny',
				minutes: 120,
				providers: ['!!!'],
			})
		).rejects.toBeInstanceOf(NoCandidatesError);
	});

	it('a real provider name still matches normally', async () => {
		globalThis.fetch = stubFetch(makeMovies(3, 1));

		const result = await pickForAnonymous(env, {
			mood: 'funny',
			minutes: 120,
			providers: ['Netflix'],
		});

		expect(result.pick.tmdbId).toBe(9001);
	});
});

describe('pickForAnonymous happy path', () => {
	it('returns the top-scored candidate with a rationale', async () => {
		globalThis.fetch = stubFetch(makeMovies(3, -1));

		const result = await pickForAnonymous(env, { mood: 'funny', minutes: 120 });

		expect(result.pick.tmdbId).toBe(9000);
		expect(result.rationale.length).toBeGreaterThan(0);
	});
});
