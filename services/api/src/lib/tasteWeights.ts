import { MoodSchema } from '@pairflix/lib.validation';
import { ERA_BUCKETS } from './eras';
import { GENRE_NAMES } from './genres';

/**
 * `mergeProfiles`/`mergeWeightRecord` (lib/recommendation.ts) merge genre/era/tone weights
 * multiplicatively across household members and treat a missing key as 0 -- a sparse write would
 * zero out every key it omits the instant it's merged against a partner's profile that does have a
 * value there. Every write to a taste profile must therefore be dense across the full key set for
 * whichever dimension it's writing, with untouched keys sitting at that dimension's neutral
 * midpoint rather than being absent.
 */
export const NEUTRAL_GENRE_WEIGHT = 0.35;
export const NEUTRAL_ERA_WEIGHT = 0.35;
export const NEUTRAL_TONE_WEIGHT = 0.35;

const denseWeights = (
	keys: readonly string[],
	weights: Record<string, number>,
	neutral: number
): Record<string, number> => {
	const dense: Record<string, number> = { ...weights };
	for (const key of keys) {
		if (!(key in dense)) dense[key] = neutral;
	}
	return dense;
};

/** Fills in every `GENRE_NAMES` id at `NEUTRAL_GENRE_WEIGHT` for any genre not already present in
 * `genres`, leaving existing values untouched. */
export const denseGenreWeights = (
	genres: Record<string, number> = {}
): Record<string, number> =>
	denseWeights(Object.keys(GENRE_NAMES), genres, NEUTRAL_GENRE_WEIGHT);

/** Same as `denseGenreWeights`, keyed by `ERA_BUCKETS` instead. */
export const denseEraWeights = (
	era: Record<string, number> = {}
): Record<string, number> => denseWeights(ERA_BUCKETS, era, NEUTRAL_ERA_WEIGHT);

/** Same as `denseGenreWeights`, keyed by the closed `Mood` enum instead. */
export const denseToneWeights = (
	tone: Record<string, number> = {}
): Record<string, number> =>
	denseWeights(MoodSchema.options, tone, NEUTRAL_TONE_WEIGHT);
