import {
	content,
	createDb,
	households,
	watchedTogether,
	type ContentProviders,
} from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { listHistory, setEnjoyed } from './history';
import { newId } from './id';

const db = createDb(env.DB);

let seq = 0;
const makeHousehold = async (): Promise<string> => {
	seq += 1;
	const id = `hh_hist_${seq}`;
	const now = new Date();
	await db
		.insert(households)
		.values({ id, name: id, createdAt: now, updatedAt: now });
	return id;
};

let tmdbSeq = 0;
const nextTmdbId = (): number => {
	tmdbSeq += 1;
	return 700_000 + tmdbSeq;
};

const seedContent = async (
	tmdbId: number,
	providers: ContentProviders
): Promise<void> => {
	const now = new Date();
	await db.insert(content).values({
		id: newId('content'),
		title: `Title ${tmdbId}`,
		type: 'movie',
		status: 'active',
		tmdbId,
		mediaType: 'movie',
		providers,
		createdAt: now,
		updatedAt: now,
	});
};

const addWatched = async (
	householdId: string,
	tmdbId: number,
	watchedAt: Date
): Promise<string> => {
	const id = newId('wt');
	await db.insert(watchedTogether).values({
		id,
		householdId,
		tmdbId,
		mediaType: 'movie',
		watchedAt,
	});
	return id;
};

describe('listHistory', () => {
	it('orders newest-first, shapes providers for the requested region, and reports single-page pagination', async () => {
		const hh = await makeHousehold();
		const older = nextTmdbId();
		const newer = nextTmdbId();
		await seedContent(older, {
			GB: {
				flatrate: [
					{ provider_id: 1, provider_name: 'Netflix GB', logo_path: null },
				],
			},
			US: {
				flatrate: [
					{ provider_id: 2, provider_name: 'Netflix US', logo_path: null },
				],
			},
		});
		await seedContent(newer, {
			US: {
				flatrate: [{ provider_id: 3, provider_name: 'Hulu', logo_path: null }],
			},
		});
		await addWatched(hh, older, new Date(Date.now() - 60_000));
		await addWatched(hh, newer, new Date());

		const page = await listHistory(db, hh, 1, 20, 'US');
		expect(page.data.map(e => e.tmdbId)).toEqual([newer, older]);
		expect(page.data[1]?.providers.flatrate?.[0]?.provider_name).toBe(
			'Netflix US'
		);
		expect(page.pagination).toEqual({
			page: 1,
			limit: 20,
			total: 2,
			totalPages: 1,
		});
	});
});

describe('setEnjoyed', () => {
	it('does not update a watched row that belongs to a different household', async () => {
		const owner = await makeHousehold();
		const other = await makeHousehold();
		const tmdbId = nextTmdbId();
		await seedContent(tmdbId, {});
		const watchedId = await addWatched(other, tmdbId, new Date());

		const result = await setEnjoyed(db, owner, watchedId, true);
		expect(result).toBeNull();

		const row = await db
			.select({ enjoyed: watchedTogether.enjoyed })
			.from(watchedTogether)
			.where(eq(watchedTogether.id, watchedId))
			.get();
		expect(row?.enjoyed).toBeNull();
	});
});
