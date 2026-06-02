import { Op } from 'sequelize';
import PickEvent, { type PickEventKind } from '../models/PickEvent';

export interface RecordPickEventInput {
	household_id: string;
	user_id?: string | null;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	kind: PickEventKind;
	mood?: string | null;
	minutes_budget?: number | null;
	provider_slug?: string | null;
	region?: string | null;
}

export interface PickEventStats {
	window_days: number;
	totals: Record<PickEventKind, number>;
	first_pick_acceptance_rate: number | null;
	provider_clicks_by_slug: Record<string, number>;
}

const ALL_KINDS: PickEventKind[] = [
	'proposed',
	'accepted',
	'swapped',
	'dismissed',
	'provider_launched',
];

export const recordPickEvent = async (
	input: RecordPickEventInput
): Promise<PickEvent> => {
	return PickEvent.create({
		household_id: input.household_id,
		user_id: input.user_id ?? null,
		tmdb_id: input.tmdb_id,
		media_type: input.media_type,
		kind: input.kind,
		mood: input.mood ?? null,
		minutes_budget: input.minutes_budget ?? null,
		provider_slug: input.provider_slug ?? null,
		region: input.region ?? null,
	});
};

export const getPickEventStats = async (
	householdId: string,
	windowDays: number = 30
): Promise<PickEventStats> => {
	const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

	const events = await PickEvent.findAll({
		where: {
			household_id: householdId,
			occurred_at: { [Op.gte]: since },
		},
	});

	const totals = ALL_KINDS.reduce<Record<PickEventKind, number>>(
		(acc, k) => {
			acc[k] = 0;
			return acc;
		},
		{} as Record<PickEventKind, number>
	);
	const providerClicks: Record<string, number> = {};

	for (const event of events) {
		totals[event.kind] += 1;
		if (event.kind === 'provider_launched' && event.provider_slug) {
			providerClicks[event.provider_slug] =
				(providerClicks[event.provider_slug] ?? 0) + 1;
		}
	}

	// First-pick acceptance: of proposals that received any user response
	// (accepted/swapped/dismissed), how many were accepted?
	const responded = totals.accepted + totals.swapped + totals.dismissed;
	const firstPickAcceptanceRate =
		responded > 0 ? totals.accepted / responded : null;

	return {
		window_days: windowDays,
		totals,
		first_pick_acceptance_rate: firstPickAcceptanceRate,
		provider_clicks_by_slug: providerClicks,
	};
};
