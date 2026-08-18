import {
	content,
	householdMembers,
	tasteProfiles,
	type Database,
} from '@pairflix/db';
import { and, eq, inArray } from 'drizzle-orm';
import type { Bindings } from '../types';
import { GENRE_NAMES } from './genres';
import { cacheContentDetails } from './providers';
import { denseGenreWeights, NEUTRAL_GENRE_WEIGHT } from './tasteWeights';

/**
 * `taste_profiles` has had zero writers since the product pivot -- `mergeProfiles` (in
 * lib/recommendation.ts) always sees an empty profile set and degrades to mood-only genre
 * filtering. This module is the first writer: a thumbs rating on a watched-together title nudges
 * every current household member's genre weights toward that rating, called from the
 * `PATCH /:id/history/:watchedId` handler (routes/households.ts) via `waitUntil`, matching this
 * codebase's non-critical-write convention (see `reserveDailyPick`, `recordPickEvent`).
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

/** Read-through `content.genreIds`: populates it via `cacheContentDetails` on a miss (missing row,
 * or a row predating this column) and re-reads rather than duplicating its TMDb fetch. Best-effort,
 * matching `cacheContentDetails` itself -- a TMDb failure leaves this returning `[]`. */
const readGenreIds = async (
	env: Bindings,
	db: Database,
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<number[]> => {
	const row = await db
		.select({ genreIds: content.genreIds })
		.from(content)
		.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, mediaType)))
		.get();
	if (row?.genreIds) return row.genreIds;

	await cacheContentDetails(env, db, tmdbId, mediaType);
	const refreshed = await db
		.select({ genreIds: content.genreIds })
		.from(content)
		.where(and(eq(content.tmdbId, tmdbId), eq(content.mediaType, mediaType)))
		.get();
	return refreshed?.genreIds ?? [];
};

/** Recomputes every current household member's taste weights off one thumbs rating. Only called
 * when `enjoyed` is non-null (the route filters that); each member's profile is read (or
 * materialized at the neutral baseline, via `denseGenreWeights`, if this is their first rating
 * ever) and upserted with the rated title's genres nudged, so every write stays dense across all of
 * `GENRE_NAMES` -- see `lib/tasteWeights.ts`'s doc comment for why a sparse write would break
 * `mergeProfiles`. */
export const recomputeTasteFromRating = async (
	env: Bindings,
	db: Database,
	householdId: string,
	tmdbId: number,
	mediaType: 'movie' | 'tv',
	enjoyed: boolean
): Promise<void> => {
	const genreIds = await readGenreIds(env, db, tmdbId, mediaType);
	if (genreIds.length === 0) return;

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
			const baseGenres = denseGenreWeights(existing?.weights.genres);
			const genres = nudgeGenreWeights(baseGenres, genreIds, enjoyed);
			const weights = { ...existing?.weights, genres };
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
