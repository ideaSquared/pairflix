import {
	content,
	householdMembers,
	tasteProfiles,
	type Database,
} from '@pairflix/db';
import type { Mood } from '@pairflix/lib.validation';
import { and, eq, inArray } from 'drizzle-orm';
import type { Bindings } from '../types';
import { eraBucketForYear, type EraBucket } from './eras';
import { GENRE_NAMES } from './genres';
import { cacheContentDetails } from './providers';
import {
	denseEraWeights,
	denseGenreWeights,
	denseToneWeights,
	NEUTRAL_ERA_WEIGHT,
	NEUTRAL_GENRE_WEIGHT,
	NEUTRAL_TONE_WEIGHT,
} from './tasteWeights';

/**
 * `taste_profiles` has had zero writers since the product pivot -- `mergeProfiles` (in
 * lib/recommendation.ts) always sees an empty profile set and degrades to mood-only genre
 * filtering. This module is the first writer: a thumbs rating on a watched-together title nudges
 * every current household member's genre/era/tone weights toward that rating, called from the
 * `PATCH /:id/history/:watchedId` handler (routes/households.ts) via `waitUntil`, matching this
 * codebase's non-critical-write convention (see `reserveDailyPick`, `recordPickEvent`).
 *
 * Four dimensions, two different update shapes:
 * - genre/era/tone are all "weight per key in a small closed vocabulary" -- the same symmetric EMA
 *   (`nudgeWeight`) applies to all three, just with a different key extracted from the rated title
 *   (genre ids, one era bucket, the mood active at pick time).
 * - runtime_pref is a single scalar minutes estimate, not a weight-per-key -- `nudgeRuntimePref`
 *   only moves on `enjoyed`, since a dislike gives no direction to move a duration estimate in
 *   (too long? too short? unrelated to runtime entirely?), unlike genre/era/tone where "you picked
 *   this and didn't like it" is itself the (negative) signal.
 */

const EMA_ALPHA = 0.25;

/** Pure EMA nudge over a dense genre-weights record -- no DB access, so this is unit-testable
 * without D1. Moves the weight for each genre on the rated title toward 1.0 (enjoyed) or 0.0 (not
 * enjoyed); every other genre in `genreWeights` is returned untouched. A rated genre id outside
 * `GENRE_NAMES` (the canonical id set every taste-profile write is dense over) is silently
 * skipped, matching `genreWeightsByName`'s (lib/recommendation.ts) same drop-unmapped-id
 * convention. */
export const nudgeGenreWeights = (
	genreWeights: Record<string, number>,
	ratedGenreIds: number[],
	enjoyed: boolean,
	alpha: number = EMA_ALPHA
): Record<string, number> => {
	const target = enjoyed ? 1 : 0;
	const next = { ...genreWeights };
	for (const genreId of ratedGenreIds) {
		if (!(genreId in GENRE_NAMES)) continue;
		const key = String(genreId);
		const current = next[key] ?? NEUTRAL_GENRE_WEIGHT;
		next[key] = current * (1 - alpha) + target * alpha;
	}
	return next;
};

/** Same EMA as `nudgeGenreWeights`, but a title has exactly one era bucket rather than a list of
 * genre ids -- nudges just that one key. */
export const nudgeEraWeights = (
	eraWeights: Record<string, number>,
	ratedEraBucket: EraBucket | null,
	enjoyed: boolean,
	alpha: number = EMA_ALPHA
): Record<string, number> => {
	if (ratedEraBucket === null) return eraWeights;
	const target = enjoyed ? 1 : 0;
	const current = eraWeights[ratedEraBucket] ?? NEUTRAL_ERA_WEIGHT;
	return {
		...eraWeights,
		[ratedEraBucket]: current * (1 - alpha) + target * alpha,
	};
};

/** Same EMA as `nudgeGenreWeights`, keyed by the single mood active at pick time rather than a list
 * of genre ids. */
export const nudgeToneWeights = (
	toneWeights: Record<string, number>,
	ratedMood: Mood | null,
	enjoyed: boolean,
	alpha: number = EMA_ALPHA
): Record<string, number> => {
	if (ratedMood === null) return toneWeights;
	const target = enjoyed ? 1 : 0;
	const current = toneWeights[ratedMood] ?? NEUTRAL_TONE_WEIGHT;
	return {
		...toneWeights,
		[ratedMood]: current * (1 - alpha) + target * alpha,
	};
};

/** Moves a single scalar minutes estimate toward the rated title's actual runtime -- only when
 * `enjoyed` (see this module's doc comment for why) and only when the runtime is actually known.
 * `current === null` (no prior estimate) adopts the rated runtime outright rather than EMA-ing
 * against a made-up starting point. */
export const nudgeRuntimePref = (
	current: number | null,
	ratedRuntime: number | null,
	enjoyed: boolean,
	alpha: number = EMA_ALPHA
): number | null => {
	if (!enjoyed || ratedRuntime === null) return current;
	if (current === null) return ratedRuntime;
	return current * (1 - alpha) + ratedRuntime * alpha;
};

type ContentSignals = {
	genreIds: number[];
	year: number | null;
	runtime: number | null;
};

/** Read-through `content`: populates it via `cacheContentDetails` on a miss (missing row, or a row
 * predating one of these columns) and re-reads rather than duplicating its TMDb fetch. Best-effort,
 * matching `cacheContentDetails` itself -- a TMDb failure leaves `genreIds` as `[]` and
 * `year`/`runtime` as `null`. The refresh trigger is `genreIds` being empty specifically (not
 * `year`/`runtime` individually) since all three come from the same upstream fetch -- if one is
 * missing after a fresh `cacheContentDetails` call, so are the others, and there's nothing further
 * to retry. */
const readContentSignals = async (
	env: Bindings,
	db: Database,
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<ContentSignals> => {
	const columns = {
		genreIds: content.genreIds,
		year: content.year,
		runtime: content.runtime,
	};
	const scope = and(
		eq(content.tmdbId, tmdbId),
		eq(content.mediaType, mediaType)
	);
	const row = await db.select(columns).from(content).where(scope).get();
	if (row?.genreIds && row.genreIds.length > 0) {
		return { ...row, genreIds: row.genreIds };
	}

	await cacheContentDetails(env, db, tmdbId, mediaType);
	const refreshed = await db.select(columns).from(content).where(scope).get();
	return {
		genreIds: refreshed?.genreIds ?? [],
		year: refreshed?.year ?? null,
		runtime: refreshed?.runtime ?? null,
	};
};

/** Recomputes every current household member's taste weights off one thumbs rating. Only called
 * when `enjoyed` is non-null (the route filters that). Each member's profile is read and upserted
 * with the rated title's genres/era/tone/runtime nudged -- genres/era/tone are only dense-filled
 * (via the `dense*Weights` helpers) and written when there's real signal for that dimension this
 * round (a genre id, an era bucket, a mood), or the profile already carries it from a prior write.
 * A dense-filled-but-never-nudged record would hand `mergeWeightRecord`'s (lib/recommendation.ts)
 * max-normalization step a perfectly flat input, which it degenerates to 1.0 for every key (dividing
 * a flat record by its own max is a no-op per key) -- a false "maximum confidence" artifact, not a
 * real signal. `runtime_pref` has no such risk (its merge is a scalar average, not a normalization)
 * and nudges unconditionally. Tone nudges even when the genre/era/runtime lookup fails entirely
 * (`moodAtPick` comes from `watchedTogether`, not TMDb, so it doesn't depend on `readContentSignals`
 * succeeding). */
export const recomputeTasteFromRating = async (
	env: Bindings,
	db: Database,
	householdId: string,
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	enjoyed: boolean,
	moodAtPick: Mood | null
): Promise<void> => {
	const { genreIds, year, runtime } = await readContentSignals(
		env,
		db,
		tmdbId,
		mediaType
	);
	if (genreIds.length === 0 && moodAtPick === null) return;
	const eraBucket = year !== null ? eraBucketForYear(year) : null;

	const members = await db
		.select({ userId: householdMembers.userId })
		.from(householdMembers)
		.where(eq(householdMembers.householdId, householdId));
	if (members.length === 0) return;

	const memberIds = members.map(m => m.userId);
	const profiles = await db
		.select()
		.from(tasteProfiles)
		.where(inArray(tasteProfiles.userId, memberIds));
	const profileByUserId = new Map(profiles.map(p => [p.userId, p]));

	const now = new Date();
	await Promise.all(
		memberIds.map(userId => {
			const existing = profileByUserId.get(userId);
			const hasGenreSignal =
				genreIds.length > 0 || existing?.weights.genres !== undefined;
			const hasEraSignal =
				eraBucket !== null || existing?.weights.era !== undefined;
			const hasToneSignal =
				moodAtPick !== null || existing?.weights.tone !== undefined;
			const weights = {
				...existing?.weights,
				...(hasGenreSignal
					? {
							genres: nudgeGenreWeights(
								denseGenreWeights(existing?.weights.genres),
								genreIds,
								enjoyed
							),
						}
					: {}),
				...(hasEraSignal
					? {
							era: nudgeEraWeights(
								denseEraWeights(existing?.weights.era),
								eraBucket,
								enjoyed
							),
						}
					: {}),
				...(hasToneSignal
					? {
							tone: nudgeToneWeights(
								denseToneWeights(existing?.weights.tone),
								moodAtPick,
								enjoyed
							),
						}
					: {}),
				runtime_pref: nudgeRuntimePref(
					existing?.weights.runtime_pref ?? null,
					runtime,
					enjoyed
				),
			};
			return db
				.insert(tasteProfiles)
				.values({ userId, weights, updatedAt: now })
				.onConflictDoUpdate({
					target: tasteProfiles.userId,
					set: { weights, updatedAt: now },
				});
		})
	);
};
