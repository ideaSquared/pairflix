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

export const MOOD_FILTERS: Record<Mood, { genres: number[]; label: string }> = {
	funny: { genres: [35], label: 'comedy' },
	dark: { genres: [80, 53], label: 'dark crime/thriller' },
	feelgood: { genres: [10751, 35], label: 'feel-good' },
	tense: { genres: [53, 27], label: 'tense thriller/horror' },
	romantic: { genres: [10749], label: 'romance' },
	thoughtful: { genres: [18], label: 'thoughtful drama' },
	action: { genres: [28, 12], label: 'action/adventure' },
};
