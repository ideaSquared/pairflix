import { tasteProfiles, users, type Database } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import type { Bindings } from '../types';
import { GENRE_NAMES } from './genres';
import { denseGenreWeights, NEUTRAL_GENRE_WEIGHT } from './tasteWeights';
import { discoverMedia, type TMDbDiscoverMovie } from './tmdb';

/**
 * The onboarding taste-starter flow (PR 2 of the taste-personalization fix -- lib/tasteRecompute.ts
 * is PR 1, the watched-together thumbs recompute). Shown once per household member at their own
 * join moment (routes/me.ts), this is `taste_profiles`'s second writer: it seeds a dense
 * genre-weights row directly from onboarding answers instead of waiting for ratings to accumulate,
 * so `mergeProfiles` (lib/recommendation.ts) has something better than a mood-only fallback from
 * the very first pick.
 */

// comedy, drama, action, horror, romance, sci-fi, documentary, animation -- a spread across
// distinct moods, not a top-N by any other criterion.
const ANCHOR_GENRE_IDS = [35, 18, 28, 27, 10749, 878, 99, 16];
const CARDS_PER_GENRE = 2;
const DECK_SIZE = 16;
// Higher than the pick path's own default (200, see lib/recommendation.ts) -- these need to be
// titles a new user actually recognizes, not just whatever clears the bar for a filtered pick.
const VOTE_COUNT_FLOOR = 500;

export type OnboardingCard = {
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	posterPath: string | null;
	genreIds: number[];
};

/** One `/discover` call per anchor genre (parallel), top `CARDS_PER_GENRE` each, deduped by
 * tmdbId -- a movie tagged with two anchor genres (e.g. an action-comedy) only appears once, kept
 * with the full `genre_ids` from whichever call it was first seen on. Movie-only, matching the pick
 * path's own `discoverMedia` calls (lib/recommendation.ts). */
export const buildOnboardingDeck = async (
	env: Bindings
): Promise<OnboardingCard[]> => {
	const responses = await Promise.all(
		ANCHOR_GENRE_IDS.map(genreId =>
			discoverMedia(env, {
				mediaType: 'movie',
				genres: [genreId],
				voteCountGte: VOTE_COUNT_FLOOR,
				sortBy: 'popularity.desc',
			})
		)
	);

	const seen = new Set<number>();
	const deck: OnboardingCard[] = [];
	for (const response of responses) {
		const top = (response.results ?? []).slice(0, CARDS_PER_GENRE);
		for (const item of top) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			deck.push({
				tmdbId: item.id,
				mediaType: 'movie',
				// Every discoverMedia call above fixes mediaType to 'movie', so item is always
				// shaped like TMDbDiscoverMovie, not the TMDbDiscoverTV half of the union.
				title: (item as TMDbDiscoverMovie).title,
				posterPath: item.poster_path,
				genreIds: item.genre_ids,
			});
		}
	}
	return deck.slice(0, DECK_SIZE);
};

const LIKED_GENRE_WEIGHT = 0.75;
const LOVE_SWIPE_DELTA = 0.15;
const NOT_FOR_ME_SWIPE_DELTA = -0.2;
const SWIPE_WEIGHT_CEILING = 1;
const SWIPE_WEIGHT_FLOOR = 0.05;

export type OnboardingSwipe = {
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	genreIds: number[];
	verdict: 'love' | 'not_for_me';
};

/** Pure weight-building over a dense genre baseline -- no DB access, so this is unit-testable
 * without D1, same split as `tasteRecompute.ts`'s `nudgeGenreWeights`. Liked genres are set to
 * `LIKED_GENRE_WEIGHT` first; swipes are then applied on top (so a genre that's both picked and
 * swiped reflects both), each swipe nudging every genre on that card by a fixed delta -- not an
 * EMA, since there's no prior rating history here to decay -- clamped to
 * `[SWIPE_WEIGHT_FLOOR, SWIPE_WEIGHT_CEILING]`. A genre id outside `GENRE_NAMES` is silently
 * skipped, matching `nudgeGenreWeights`'s own convention. */
export const buildOnboardingGenreWeights = (
	likedGenreIds: number[],
	swipes: OnboardingSwipe[]
): Record<string, number> => {
	const weights = denseGenreWeights();

	for (const genreId of likedGenreIds) {
		if (!(genreId in GENRE_NAMES)) continue;
		weights[String(genreId)] = LIKED_GENRE_WEIGHT;
	}

	for (const swipe of swipes) {
		const delta =
			swipe.verdict === 'love' ? LOVE_SWIPE_DELTA : NOT_FOR_ME_SWIPE_DELTA;
		for (const genreId of swipe.genreIds) {
			if (!(genreId in GENRE_NAMES)) continue;
			const key = String(genreId);
			const current = weights[key] ?? NEUTRAL_GENRE_WEIGHT;
			weights[key] = Math.min(
				SWIPE_WEIGHT_CEILING,
				Math.max(SWIPE_WEIGHT_FLOOR, current + delta)
			);
		}
	}

	return weights;
};

export type OnboardingSubmission = {
	likedGenreIds: number[];
	swipes: OnboardingSwipe[];
	providers: string[];
};

/** Writes both `taste_profiles` (genre weights, seeded fresh from onboarding answers -- unlike
 * `recomputeTasteFromRating`'s EMA nudge, there's no prior rating history here to nudge) and
 * `users.preferences.selectedProviders`, upserting the taste profile the same
 * read-existing-then-`onConflictDoUpdate` way `tasteRecompute.ts` does, so a second onboarding
 * submission (or a profile already seeded by a rating) only ever overwrites `weights.genres`. */
export const submitOnboarding = async (
	db: Database,
	userId: string,
	input: OnboardingSubmission
): Promise<void> => {
	const genres = buildOnboardingGenreWeights(input.likedGenreIds, input.swipes);

	const [existingProfile, user] = await Promise.all([
		db
			.select({ weights: tasteProfiles.weights })
			.from(tasteProfiles)
			.where(eq(tasteProfiles.userId, userId))
			.get(),
		db
			.select({ preferences: users.preferences })
			.from(users)
			.where(eq(users.id, userId))
			.get(),
	]);
	// requireAuth only resolves userId from a live, unexpired session row, and sessions.userId
	// cascades on delete -- a session pointing at a userId with no users row is not a reachable
	// state, so this is an invariant check, not a real-world 404.
	if (!user) throw new Error(`submitOnboarding: user ${userId} not found`);

	const now = new Date();
	const weights = { ...existingProfile?.weights, genres };
	const preferences = {
		...user.preferences,
		selectedProviders: input.providers,
	};

	await Promise.all([
		db
			.insert(tasteProfiles)
			.values({ userId, weights, updatedAt: now })
			.onConflictDoUpdate({
				target: tasteProfiles.userId,
				set: { weights, updatedAt: now },
			}),
		db
			.update(users)
			.set({ preferences, updatedAt: now })
			.where(eq(users.id, userId)),
	]);
};
