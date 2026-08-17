import { pickEvents, type Database } from '@pairflix/db';
import { newId } from './id';

export type PickEventKind =
	'proposed' | 'accepted' | 'swapped' | 'dismissed' | 'provider_launched';

export type RecordPickEventInput = {
	householdId: string;
	userId?: string | null;
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	kind: PickEventKind;
	mood?: string | null;
	minutesBudget?: number | null;
	providerSlug?: string | null;
	region?: string | null;
};

/** Backs the first-pick acceptance-rate KPI (see packages/db/src/schema.ts's `pickEvents` doc
 * comment) -- every caller that proposes or resolves a pick should record one of these. Left as a
 * plain awaitable write; callers that want fire-and-forget semantics (e.g. not failing a pick
 * response over a bookkeeping write) decide that at the route layer, matching how `auth.ts`
 * handles its own best-effort `lastLogin` write. */
export const recordPickEvent = async (
	db: Database,
	input: RecordPickEventInput
): Promise<void> => {
	await db.insert(pickEvents).values({
		id: newId('pickevent'),
		householdId: input.householdId,
		userId: input.userId ?? null,
		tmdbId: input.tmdbId,
		mediaType: input.mediaType,
		kind: input.kind,
		mood: input.mood ?? null,
		minutesBudget: input.minutesBudget ?? null,
		providerSlug: input.providerSlug ?? null,
		region: input.region ?? null,
		occurredAt: new Date(),
	});
};
