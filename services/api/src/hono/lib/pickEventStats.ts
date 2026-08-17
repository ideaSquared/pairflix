import { pickEvents, type Database } from '@pairflix/db';
import { and, eq, gte } from 'drizzle-orm';
import type { PickEventKind } from './pickEvents';

export type PickEventStats = {
	windowDays: number;
	totals: Record<PickEventKind, number>;
	firstPickAcceptanceRate: number | null;
	providerClicksBySlug: Record<string, number>;
};

/** `provider_launched` events recorded without a `providerSlug` still count toward
 * `totals.provider_launched`, but are silently excluded from `providerClicksBySlug`, which only
 * makes sense keyed by an actual slug. */
export const getPickEventStats = async (
	db: Database,
	householdId: string,
	windowDays: number
): Promise<PickEventStats> => {
	const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

	const events = await db
		.select({ kind: pickEvents.kind, providerSlug: pickEvents.providerSlug })
		.from(pickEvents)
		.where(
			and(
				eq(pickEvents.householdId, householdId),
				gte(pickEvents.occurredAt, since)
			)
		);

	const totals: Record<PickEventKind, number> = {
		proposed: 0,
		accepted: 0,
		swapped: 0,
		dismissed: 0,
		provider_launched: 0,
	};
	const providerClicksBySlug: Record<string, number> = {};

	for (const event of events) {
		totals[event.kind] += 1;
		if (event.kind === 'provider_launched' && event.providerSlug) {
			providerClicksBySlug[event.providerSlug] =
				(providerClicksBySlug[event.providerSlug] ?? 0) + 1;
		}
	}

	const responded = totals.accepted + totals.swapped + totals.dismissed;
	const firstPickAcceptanceRate =
		responded > 0 ? totals.accepted / responded : null;

	return { windowDays, totals, firstPickAcceptanceRate, providerClicksBySlug };
};
