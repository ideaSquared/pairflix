import {
	content,
	createDb,
	type ContentProviders,
	type ProviderEntry,
} from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cacheContentDetails, getCachedProviders } from './providers';
import { newId } from './id';

const db = createDb(env.DB);

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
	vi.restoreAllMocks();
});

let seq = 0;
/** A fresh TMDb id per test -- the (tmdbId, mediaType) unique index means reused ids would collide. */
const nextTmdbId = (): number => {
	seq += 1;
	return 900_000 + seq;
};

const jsonResponse = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

const provider = (name: string): ProviderEntry => ({
	provider_id: 8,
	provider_name: name,
	logo_path: '/logo.png',
});

const seedContent = async (
	tmdbId: number,
	providers: ContentProviders
): Promise<void> => {
	const now = new Date();
	await db.insert(content).values({
		id: newId('content'),
		title: 'Seeded',
		type: 'movie',
		status: 'active',
		tmdbId,
		mediaType: 'movie',
		providers,
		createdAt: now,
		updatedAt: now,
	});
};

describe('getCachedProviders', () => {
	it('refreshes from TMDb on a cache miss, persists a row, and returns the region', async () => {
		const tmdbId = nextTmdbId();
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse({
				results: {
					GB: { flatrate: [provider('Netflix')], link: 'https://tmdb/gb' },
				},
			})
		);
		globalThis.fetch = fetchMock;

		const region = await getCachedProviders(env, db, tmdbId, 'movie', 'GB');
		expect(region.flatrate?.[0]?.provider_name).toBe('Netflix');
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const row = await db
			.select()
			.from(content)
			.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, 'movie')))
			.get();
		// refreshProviders writes a placeholder title on the cache-miss insert.
		expect(row?.title).toBe('Untitled movie');
	});

	it('serves a fresh cache hit without hitting TMDb', async () => {
		const tmdbId = nextTmdbId();
		await seedContent(tmdbId, {
			last_updated_at: new Date().toISOString(),
			GB: { flatrate: [provider('Disney Plus')] },
		});
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;

		const region = await getCachedProviders(env, db, tmdbId, 'movie', 'GB');
		expect(region.flatrate?.[0]?.provider_name).toBe('Disney Plus');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('shapes the response to the requested region', async () => {
		const tmdbId = nextTmdbId();
		await seedContent(tmdbId, {
			last_updated_at: new Date().toISOString(),
			GB: { flatrate: [provider('Netflix')] },
			US: { flatrate: [provider('Hulu')] },
		});
		globalThis.fetch = vi.fn();

		const gb = await getCachedProviders(env, db, tmdbId, 'movie', 'GB');
		const us = await getCachedProviders(env, db, tmdbId, 'movie', 'US');
		expect(gb.flatrate?.[0]?.provider_name).toBe('Netflix');
		expect(us.flatrate?.[0]?.provider_name).toBe('Hulu');
	});

	it('falls back to stale cached data when a refresh fails', async () => {
		const tmdbId = nextTmdbId();
		const staleAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
		await seedContent(tmdbId, {
			last_updated_at: staleAt,
			GB: { flatrate: [provider('Netflix')] },
		});
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('tmdb down'));

		const region = await getCachedProviders(env, db, tmdbId, 'movie', 'GB');
		expect(region.flatrate?.[0]?.provider_name).toBe('Netflix');
	});
});

describe('cacheContentDetails', () => {
	it('caches title, year, runtime, poster and genres from TMDb movie details', async () => {
		const tmdbId = nextTmdbId();
		globalThis.fetch = vi.fn().mockResolvedValue(
			jsonResponse({
				id: tmdbId,
				title: 'Inception',
				release_date: '2010-07-16',
				runtime: 148,
				poster_path: '/poster.jpg',
				genres: [{ id: 28, name: 'Action' }],
			})
		);

		await cacheContentDetails(env, db, tmdbId, 'movie');

		const row = await db
			.select()
			.from(content)
			.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, 'movie')))
			.get();
		expect(row?.title).toBe('Inception');
		expect(row?.year).toBe(2010);
		expect(row?.runtime).toBe(148);
		expect(row?.posterPath).toBe('/poster.jpg');
		expect(row?.genreIds).toEqual([28]);
	});

	it('leaves an existing row untouched when the TMDb fetch fails', async () => {
		const tmdbId = nextTmdbId();
		await seedContent(tmdbId, {});
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('tmdb down'));

		await cacheContentDetails(env, db, tmdbId, 'movie');

		const row = await db
			.select()
			.from(content)
			.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, 'movie')))
			.get();
		expect(row?.title).toBe('Seeded');
	});

	it('does not overwrite an existing title when TMDb returns no title', async () => {
		const tmdbId = nextTmdbId();
		await seedContent(tmdbId, {});
		globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse({ id: tmdbId }));

		await cacheContentDetails(env, db, tmdbId, 'movie');

		const row = await db
			.select()
			.from(content)
			.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, 'movie')))
			.get();
		expect(row?.title).toBe('Seeded');
	});
});
