import { GENRE_NAMES } from './genres';

/**
 * `mergeProfiles` (lib/recommendation.ts) merges genre weights multiplicatively across household
 * members and treats a missing key as 0 -- a sparse write would zero out every genre it omits the
 * instant it's merged against a partner's profile that does have a value there. Every write to a
 * taste profile must therefore be dense across all of `GENRE_NAMES`, with untouched genres sitting
 * at this neutral midpoint rather than being absent.
 */
export const NEUTRAL_GENRE_WEIGHT = 0.35;

/** Fills in every `GENRE_NAMES` id at `NEUTRAL_GENRE_WEIGHT` for any genre not already present in
 * `genres`, leaving existing values untouched. */
export const denseGenreWeights = (
	genres: Record<string, number> = {}
): Record<string, number> => {
	const dense: Record<string, number> = { ...genres };
	for (const idStr of Object.keys(GENRE_NAMES)) {
		if (!(idStr in dense)) dense[idStr] = NEUTRAL_GENRE_WEIGHT;
	}
	return dense;
};
