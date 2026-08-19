/** A title's release year is bucketed into a small, fixed vocabulary -- the same reasoning as
 * `GENRE_NAMES` in `lib/genres.ts`: `taste_profiles.weights.era` needs a bounded key set so
 * `mergeProfiles`-style multiplicative merging and dense-fill both work the same way they do for
 * genres. Raw years aren't used as keys directly -- that would make every distinct year its own
 * near-single-sample bucket. */
export const ERA_BUCKETS = [
	'pre1980',
	'1980s',
	'1990s',
	'2000s',
	'2010s',
	'2020s',
] as const;

export type EraBucket = (typeof ERA_BUCKETS)[number];

export const eraBucketForYear = (year: number): EraBucket => {
	if (year < 1980) return 'pre1980';
	if (year < 1990) return '1980s';
	if (year < 2000) return '1990s';
	if (year < 2010) return '2000s';
	if (year < 2020) return '2010s';
	return '2020s';
};
