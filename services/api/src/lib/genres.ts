import type { Mood } from '@pairflix/lib.validation';

/** TMDb movie genre id -> name. Also used to bridge id-keyed `taste_profiles.weights.genres` into
 * the name-keyed input `lib/tasteSummary.ts` (and, transitively, the LLM prompt) expect. */
export const GENRE_NAMES: Record<number, string> = {
	28: 'action',
	12: 'adventure',
	16: 'animation',
	35: 'comedy',
	80: 'crime',
	99: 'documentary',
	18: 'drama',
	10751: 'family',
	14: 'fantasy',
	36: 'history',
	27: 'horror',
	10402: 'music',
	9648: 'mystery',
	10749: 'romance',
	878: 'sci-fi',
	53: 'thriller',
	10752: 'war',
	37: 'western',
};

/** TMDb's TV genre list only shares these ids with the movie list above -- TV has no standalone
 * Horror (27), Romance (10749), or Thriller (53) at all, so there's no way to map `dark`/`tense`/
 * `romantic` onto TV. `lib/recommendation.ts` only fetches TV candidates when every genre id a mood
 * would filter on is either in this set or is the Action/Adventure exception below, so a
 * `/discover/tv` call never filters on an id that doesn't exist in TV's taxonomy. */
export const TV_COMPATIBLE_GENRE_IDS = new Set<number>([
	16, 35, 80, 99, 18, 10751, 9648, 37,
]);

/** TMDb's TV "Action & Adventure" id -- the one case where TV genuinely has an equivalent for a
 * movie mood's genres, just under a different numeric id: movie Action (28) and Adventure (12)
 * both merge into this single TV id rather than sharing either movie id directly. */
export const TV_ACTION_ADVENTURE_GENRE_ID = 10759;

/** Every genre id this codebase stores or scores against -- `GENRE_NAMES`, `taste_profiles.weights.
 * genres`, and `MOOD_FILTERS` -- is keyed by the movie id space. Expands TV_ACTION_ADVENTURE_GENRE_ID
 * back to the movie ids it represents so a TV item's raw `genre_ids` (from `/discover/tv`, or a full
 * `/tv/:id` details fetch) can be treated the same as a movie's everywhere that keyspace matters:
 * scoring, taste-weight nudging, rationale text, and the LLM candidate payload. Every other TV genre
 * id already equals its movie counterpart (see TV_COMPATIBLE_GENRE_IDS) and passes through
 * unchanged; calling this on a movie's own genre_ids is always a no-op, since 10759 never appears
 * there. */
export const toMovieGenreIds = (genreIds: number[]): number[] =>
	genreIds.flatMap(g => (g === TV_ACTION_ADVENTURE_GENRE_ID ? [28, 12] : [g]));

export const MOOD_FILTERS: Record<Mood, { genres: number[]; label: string }> = {
	funny: { genres: [35], label: 'comedy' },
	dark: { genres: [80, 53], label: 'dark crime/thriller' },
	feelgood: { genres: [10751, 35], label: 'feel-good' },
	tense: { genres: [53, 27], label: 'tense thriller/horror' },
	romantic: { genres: [10749], label: 'romance' },
	thoughtful: { genres: [18], label: 'thoughtful drama' },
	action: { genres: [28, 12], label: 'action/adventure' },
};
