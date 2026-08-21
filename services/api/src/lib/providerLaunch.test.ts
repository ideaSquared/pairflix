import {
	content,
	createDb,
	type ContentProviders,
	type ProviderEntry,
	type ProviderRegion,
} from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from './id';
import {
	ProviderNotAvailableError,
	resolveProviderLaunch,
} from './providerLaunch';

const db = createDb(env.DB);

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
	vi.restoreAllMocks();
});

let seq = 0;
const nextTmdbId = (): number => {
	seq += 1;
	return 800_000 + seq;
};

const provider = (name: string): ProviderEntry => ({
	provider_id: 1,
	provider_name: name,
	logo_path: null,
});

/** Seeds a fresh cache row so resolveProviderLaunch reads through providers.ts without a fetch. */
const seedFreshCache = async (
	tmdbId: number,
	region: string,
	regional: ProviderRegion
): Promise<void> => {
	const now = new Date();
	const providers: ContentProviders = {
		last_updated_at: now.toISOString(),
		[region]: regional,
	};
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

describe('resolveProviderLaunch', () => {
	it('resolves the TMDb watch link and provider name for a flatrate match', async () => {
		const tmdbId = nextTmdbId();
		await seedFreshCache(tmdbId, 'GB', {
			flatrate: [provider('Netflix')],
			link: 'https://tmdb/watch/gb',
		});
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;

		const result = await resolveProviderLaunch(
			env,
			db,
			tmdbId,
			'movie',
			'netflix',
			'GB'
		);
		expect(result).toEqual({
			url: 'https://tmdb/watch/gb',
			providerName: 'Netflix',
			region: 'GB',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('matches a provider slug that is a substring of the provider name', async () => {
		const tmdbId = nextTmdbId();
		await seedFreshCache(tmdbId, 'GB', {
			flatrate: [provider('Amazon Prime Video')],
			link: 'https://x',
		});
		globalThis.fetch = vi.fn();

		const result = await resolveProviderLaunch(
			env,
			db,
			tmdbId,
			'movie',
			'prime',
			'GB'
		);
		expect(result.providerName).toBe('Amazon Prime Video');
	});

	it('matches providers offered only for rent, not just flatrate', async () => {
		const tmdbId = nextTmdbId();
		await seedFreshCache(tmdbId, 'GB', {
			rent: [provider('Apple TV')],
			link: 'https://x',
		});
		globalThis.fetch = vi.fn();

		const result = await resolveProviderLaunch(
			env,
			db,
			tmdbId,
			'movie',
			'appletv',
			'GB'
		);
		expect(result.providerName).toBe('Apple TV');
	});

	it('throws ProviderNotAvailableError when no candidate matches the slug', async () => {
		const tmdbId = nextTmdbId();
		await seedFreshCache(tmdbId, 'GB', {
			flatrate: [provider('Netflix')],
			link: 'https://x',
		});
		globalThis.fetch = vi.fn();

		await expect(
			resolveProviderLaunch(env, db, tmdbId, 'movie', 'hulu', 'GB')
		).rejects.toBeInstanceOf(ProviderNotAvailableError);
	});

	it('throws ProviderNotAvailableError when a provider matches but the region has no watch link', async () => {
		const tmdbId = nextTmdbId();
		await seedFreshCache(tmdbId, 'GB', { flatrate: [provider('Netflix')] });
		globalThis.fetch = vi.fn();

		const err = await resolveProviderLaunch(
			env,
			db,
			tmdbId,
			'movie',
			'netflix',
			'GB'
		).catch(e => e);
		expect(err).toBeInstanceOf(ProviderNotAvailableError);
		expect((err as Error).message).toContain('GB');
	});
});
