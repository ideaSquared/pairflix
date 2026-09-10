import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	discoverMedia,
	getAllWatchProviders,
	getMovieFullDetails,
	getWatchProviders,
	TMDbConfigError,
	TMDbRateLimitError,
	TMDbRequestError,
	TMDbServerError,
} from './tmdb';

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

const discoverParams = (genres: number[]) => ({
	mediaType: 'movie' as const,
	genres,
});

describe('tmdbFetch (via discoverMedia)', () => {
	it('fails fast with TMDbConfigError when TMDB_API_KEY is unset, without calling fetch', async () => {
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;

		await expect(
			discoverMedia({ ...env, TMDB_API_KEY: undefined }, discoverParams([1]))
		).rejects.toBeInstanceOf(TMDbConfigError);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('passes an AbortSignal so a hung request can be timed out', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
		globalThis.fetch = fetchMock;

		await discoverMedia(env, discoverParams([2]));

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});

	it('throws TMDbRequestError (not a generic 500) for a non-retryable 4xx like an invalid key', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('nope', { status: 401 }));

		const err = await getMovieFullDetails(env, 1).catch(e => e);
		expect(err).toBeInstanceOf(TMDbRequestError);
		expect((err as TMDbRequestError).statusCode).toBe(502);
	});

	it('throws TMDbRateLimitError (statusCode 429) on a 429 response', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('slow down', { status: 429 }));

		const err = await getMovieFullDetails(env, 1).catch(e => e);
		expect(err).toBeInstanceOf(TMDbRateLimitError);
		expect((err as TMDbRateLimitError).statusCode).toBe(429);
	});

	it('throws TMDbServerError on a 5xx response', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('boom', { status: 503 }));

		const err = await getMovieFullDetails(env, 1).catch(e => e);
		expect(err).toBeInstanceOf(TMDbServerError);
		expect((err as TMDbServerError).statusCode).toBe(502);
	});

	it('does not retry non-discover calls even on a transient failure', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('boom', { status: 500 }));
		globalThis.fetch = fetchMock;

		await expect(getMovieFullDetails(env, 1)).rejects.toBeInstanceOf(
			TMDbServerError
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('does not retry getAllWatchProviders/getWatchProviders on a transient failure', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('boom', { status: 429 }));
		globalThis.fetch = fetchMock;

		await expect(
			getWatchProviders(env, 1, 'movie', 'GB')
		).rejects.toBeInstanceOf(TMDbRateLimitError);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		fetchMock.mockClear();
		await expect(getAllWatchProviders(env, 1, 'movie')).rejects.toBeInstanceOf(
			TMDbRateLimitError
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe('discoverMedia retry', () => {
	it('retries once on a 429 and succeeds on the second attempt', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response('slow down', { status: 429 }))
			.mockResolvedValueOnce(jsonResponse({ results: [{ id: 1 }] }));
		globalThis.fetch = fetchMock;

		const result = await discoverMedia(env, discoverParams([3]));
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(result.results).toHaveLength(1);
	});

	it('retries once on a 5xx and still throws TMDbServerError if the retry also fails', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('boom', { status: 502 }));
		globalThis.fetch = fetchMock;

		await expect(
			discoverMedia(env, discoverParams([4]))
		).rejects.toBeInstanceOf(TMDbServerError);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('does not retry a non-retryable 4xx', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('bad request', { status: 400 }));
		globalThis.fetch = fetchMock;

		await expect(
			discoverMedia(env, discoverParams([5]))
		).rejects.toBeInstanceOf(TMDbRequestError);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe('discoverMedia edge caching', () => {
	it('does not cache outside production -- every call hits TMDb', async () => {
		// A fresh Response per call -- a Response body can only be read (`.json()`) once, and
		// `mockResolvedValue` would otherwise hand out the same instance both times.
		const fetchMock = vi.fn(async () => jsonResponse({ results: [] }));
		globalThis.fetch = fetchMock;

		await discoverMedia(env, discoverParams([601]));
		await discoverMedia(env, discoverParams([601]));

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('serves a second identical request from cache in production instead of calling TMDb again', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(jsonResponse({ results: [{ id: 42 }] }));
		globalThis.fetch = fetchMock;
		const prodEnv = { ...env, ENVIRONMENT: 'production' };

		const first = await discoverMedia(prodEnv, discoverParams([602]));
		const second = await discoverMedia(prodEnv, discoverParams([602]));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(second).toEqual(first);
	});

	it('does not share a cache entry across different discover params', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ results: [] }));
		globalThis.fetch = fetchMock;
		const prodEnv = { ...env, ENVIRONMENT: 'production' };

		await discoverMedia(prodEnv, discoverParams([603]));
		await discoverMedia(prodEnv, discoverParams([604]));

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
