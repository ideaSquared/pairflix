import { createDb, households, pickEvents } from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { newId } from './id';
import { getPickEventStats } from './pickEventStats';
import type { PickEventKind } from './pickEvents';

const db = createDb(env.DB);

let seq = 0;
const makeHousehold = async (): Promise<string> => {
	seq += 1;
	const id = `hh_pes_${seq}`;
	const now = new Date();
	await db
		.insert(households)
		.values({ id, name: id, createdAt: now, updatedAt: now });
	return id;
};

type EventOpts = { providerSlug?: string | null; occurredAt?: Date };
const addEvent = async (
	householdId: string,
	kind: PickEventKind,
	opts: EventOpts = {}
): Promise<void> => {
	await db.insert(pickEvents).values({
		id: newId('pickevent'),
		householdId,
		tmdbId: 1,
		mediaType: 'movie',
		kind,
		providerSlug: opts.providerSlug ?? null,
		occurredAt: opts.occurredAt ?? new Date(),
	});
};

describe('getPickEventStats', () => {
	it('aggregates totals, counts swaps in the acceptance denominator, and tallies clicks per slug', async () => {
		const hh = await makeHousehold();
		await addEvent(hh, 'proposed');
		await addEvent(hh, 'proposed');
		await addEvent(hh, 'accepted');
		await addEvent(hh, 'swapped');
		await addEvent(hh, 'dismissed');
		await addEvent(hh, 'provider_launched', { providerSlug: 'netflix' });
		await addEvent(hh, 'provider_launched', { providerSlug: 'netflix' });
		await addEvent(hh, 'provider_launched', { providerSlug: 'disney' });

		const stats = await getPickEventStats(db, hh, 30);
		expect(stats.windowDays).toBe(30);
		expect(stats.totals).toEqual({
			proposed: 2,
			accepted: 1,
			swapped: 1,
			dismissed: 1,
			provider_launched: 3,
		});
		expect(stats.firstPickAcceptanceRate).toBeCloseTo(1 / 3);
		expect(stats.providerClicksBySlug).toEqual({ netflix: 2, disney: 1 });
	});

	it('excludes events older than the window', async () => {
		const hh = await makeHousehold();
		await addEvent(hh, 'accepted', { occurredAt: new Date() });
		await addEvent(hh, 'dismissed', {
			occurredAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
		});

		const stats = await getPickEventStats(db, hh, 30);
		expect(stats.totals.accepted).toBe(1);
		expect(stats.totals.dismissed).toBe(0);
		expect(stats.firstPickAcceptanceRate).toBe(1);
	});

	it('reports a null acceptance rate when no pick has been responded to', async () => {
		const hh = await makeHousehold();
		await addEvent(hh, 'proposed');
		await addEvent(hh, 'provider_launched', { providerSlug: 'netflix' });

		const stats = await getPickEventStats(db, hh, 30);
		expect(stats.firstPickAcceptanceRate).toBeNull();
	});

	it('counts slug-less provider launches in the total but not the per-slug breakdown', async () => {
		const hh = await makeHousehold();
		await addEvent(hh, 'provider_launched', { providerSlug: null });
		await addEvent(hh, 'provider_launched', { providerSlug: null });
		await addEvent(hh, 'provider_launched', { providerSlug: 'netflix' });

		const stats = await getPickEventStats(db, hh, 30);
		expect(stats.totals.provider_launched).toBe(3);
		expect(stats.providerClicksBySlug).toEqual({ netflix: 1 });
	});
});
