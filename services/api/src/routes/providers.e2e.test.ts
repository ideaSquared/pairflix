import { afterEach, describe, expect, it } from 'vitest';
import { callApp, createLoggedInUser } from '../test/test-helpers';

let counter = 0;
/** A fresh tmdbId per test that populates the cache -- D1 storage isn't reset between tests
 * within one file, and `content` rows are keyed by (tmdbId, mediaType). */
const uniqueTmdbId = () => 900_000 + counter++;
const uniqueEmail = () => `providers-e2e-${Date.now()}-${counter}@example.com`;

const jsonResponse = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
});

type MockWatchProviders = {
	link?: string;
	flatrate?: Array<{
		provider_id: number;
		provider_name: string;
		logo_path: string;
	}>;
};

/** Mocks only the TMDb watch-providers endpoint -- this domain never calls /discover or
 * /movie/:id, unlike the households/pick recommender. */
const mockTmdbProviders = (
	byRegion: Record<string, MockWatchProviders>
): string[] => {
	const capturedUrls: string[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: input.url;
		capturedUrls.push(url);
		const { hostname, pathname } = new URL(url);
		if (
			hostname === 'api.themoviedb.org' &&
			/^\/3\/(movie|tv)\/\d+\/watch\/providers$/.test(pathname)
		) {
			return jsonResponse({ results: byRegion });
		}
		throw new Error(`Unmocked fetch in test: ${url}`);
	}) as typeof fetch;
	return capturedUrls;
};

describe('GET /api/providers/:tmdbId', () => {
	it('returns provider data for the requested region', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const tmdbId = uniqueTmdbId();
		mockTmdbProviders({
			GB: {
				flatrate: [
					{ provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
				],
				link: `https://www.themoviedb.org/movie/${tmdbId}/watch?locale=GB`,
			},
		});

		const result = await callApp<{
			region: string;
			providers: { flatrate?: unknown[] };
		}>(`/api/providers/${tmdbId}?mediaType=movie`, { cookies });
		expect(result.status).toBe(200);
		expect(result.body.region).toBe('GB');
		expect(result.body.providers.flatrate).toHaveLength(1);
	});

	it('caches -- a second call within the freshness window does not refetch TMDb', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const tmdbId = uniqueTmdbId();
		const capturedUrls = mockTmdbProviders({
			GB: {
				flatrate: [
					{ provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
				],
			},
		});

		const first = await callApp(`/api/providers/${tmdbId}?mediaType=movie`, {
			cookies,
		});
		expect(first.status).toBe(200);
		expect(capturedUrls).toHaveLength(1);

		const second = await callApp(`/api/providers/${tmdbId}?mediaType=movie`, {
			cookies,
		});
		expect(second.status).toBe(200);
		expect(capturedUrls).toHaveLength(1);
	});

	it('keeps movie and tv caches separate for the same tmdbId', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const tmdbId = uniqueTmdbId();
		let callCount = 0;
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url =
				typeof input === 'string'
					? input
					: input instanceof URL
						? input.toString()
						: input.url;
			callCount += 1;
			const isTv = new URL(url).pathname.includes('/tv/');
			return jsonResponse({
				results: {
					GB: {
						flatrate: [
							{
								provider_id: isTv ? 2 : 8,
								provider_name: isTv ? 'Disney Plus' : 'Netflix',
								logo_path: '/x.jpg',
							},
						],
					},
				},
			});
		}) as typeof fetch;

		const movie = await callApp<{
			providers: { flatrate?: Array<{ provider_name: string }> };
		}>(`/api/providers/${tmdbId}?mediaType=movie`, { cookies });
		const tv = await callApp<{
			providers: { flatrate?: Array<{ provider_name: string }> };
		}>(`/api/providers/${tmdbId}?mediaType=tv`, { cookies });

		expect(movie.body.providers.flatrate?.[0]?.provider_name).toBe('Netflix');
		expect(tv.body.providers.flatrate?.[0]?.provider_name).toBe('Disney Plus');
		expect(callCount).toBe(2);
	});

	it('degrades to an empty result rather than failing when TMDb errors', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const tmdbId = uniqueTmdbId();
		globalThis.fetch = (async () =>
			jsonResponse({ error: 'boom' }, 500)) as typeof fetch;

		const result = await callApp<{ providers: Record<string, unknown> }>(
			`/api/providers/${tmdbId}?mediaType=movie`,
			{ cookies }
		);
		expect(result.status).toBe(200);
		expect(result.body.providers).toEqual({});
	});

	it('rejects an invalid tmdbId', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const result = await callApp(
			'/api/providers/not-a-number?mediaType=movie',
			{
				cookies,
			}
		);
		expect(result.status).toBe(400);
	});

	it('rejects a missing mediaType', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const tmdbId = uniqueTmdbId();
		const result = await callApp(`/api/providers/${tmdbId}`, { cookies });
		expect(result.status).toBe(400);
	});
});
