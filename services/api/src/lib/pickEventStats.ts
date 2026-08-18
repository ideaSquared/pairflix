import { pickEvents, type Database } from '@pairflix/db';
import { and, count, eq, gte, isNotNull } from 'drizzle-orm';
import type { PickEventKind } from './pickEvents';

export type PickEventStats = {
	windowDays: number;
	totals: Record<PickEventKind, number>;
	firstPickAcceptanceRate: number | null;
	providerClicksBySlug: Record<string, number>;
};

/** `provider_launched` events recorded without a `providerSlug` still count toward
 * `totals.provider_launched`, but are excluded from `providerClicksBySlug`, which only makes
 * sense keyed by an actual slug -- the `isNotNull` guard on the second query is what does that
 * exclusion. Aggregates in SQL (`GROUP BY` + `count()`) rather than pulling every matching row
 * into the Worker to sum in JS -- a premium household has no pick-quota cap, so its event count
 * over a wide window isn't bounded the way a free household's is. */
export const getPickEventStats = async (
	db: Database,
	householdId: string,
	windowDays: number
): Promise<PickEventStats> => {
	const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
	const inWindow = and(
		eq(pickEvents.householdId, householdId),
		gte(pickEvents.occurredAt, since)
	);

	const [totalsRows, providerRows] = await Promise.all([
		db
			.select({ kind: pickEvents.kind, total: count() })
			.from(pickEvents)
			.where(inWindow)
			.groupBy(pickEvents.kind),
		db
			.select({ providerSlug: pickEvents.providerSlug, total: count() })
			.from(pickEvents)
			.where(
				and(
					inWindow,
					eq(pickEvents.kind, 'provider_launched'),
					isNotNull(pickEvents.providerSlug)
				)
			)
			.groupBy(pickEvents.providerSlug),
	]);

	const totals: Record<PickEventKind, number> = {
		proposed: 0,
		accepted: 0,
		swapped: 0,
		dismissed: 0,
		provider_launched: 0,
	};
	for (const row of totalsRows) {
		totals[row.kind] = row.total;
	}

	const providerClicksBySlug: Record<string, number> = {};
	for (const row of providerRows) {
		if (row.providerSlug) providerClicksBySlug[row.providerSlug] = row.total;
	}

	const responded = totals.accepted + totals.swapped + totals.dismissed;
	const firstPickAcceptanceRate =
		responded > 0 ? totals.accepted / responded : null;

	return { windowDays, totals, firstPickAcceptanceRate, providerClicksBySlug };
};
