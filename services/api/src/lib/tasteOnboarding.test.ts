import { describe, expect, it } from 'vitest';
import { GENRE_NAMES } from './genres';
import { buildOnboardingGenreWeights } from './tasteOnboarding';
import { NEUTRAL_GENRE_WEIGHT } from './tasteWeights';

describe('buildOnboardingGenreWeights', () => {
	it('is dense across every GENRE_NAMES id at the neutral weight given no input', () => {
		const weights = buildOnboardingGenreWeights([], []);
		const genreIds = Object.keys(GENRE_NAMES);
		expect(Object.keys(weights)).toHaveLength(genreIds.length);
		for (const id of genreIds) {
			expect(weights[id]).toBe(NEUTRAL_GENRE_WEIGHT);
		}
	});

	it('weights a picked genre at 0.75 and leaves the rest neutral', () => {
		const weights = buildOnboardingGenreWeights([35], []);
		expect(weights['35']).toBe(0.75);
		expect(weights['18']).toBe(NEUTRAL_GENRE_WEIGHT);
	});

	it('nudges a loved swipe up by 0.15 from the neutral baseline', () => {
		const weights = buildOnboardingGenreWeights(
			[],
			[{ tmdbId: 1, mediaType: 'movie', genreIds: [35], verdict: 'love' }]
		);
		expect(weights['35']).toBeCloseTo(0.5, 10);
	});

	it('nudges a not-for-me swipe down by 0.2 from the neutral baseline', () => {
		const weights = buildOnboardingGenreWeights(
			[],
			[
				{
					tmdbId: 1,
					mediaType: 'movie',
					genreIds: [35],
					verdict: 'not_for_me',
				},
			]
		);
		expect(weights['35']).toBeCloseTo(0.15, 10);
	});

	it('applies swipe deltas on top of a picked genre, not instead of it', () => {
		const weights = buildOnboardingGenreWeights(
			[35],
			[{ tmdbId: 1, mediaType: 'movie', genreIds: [35], verdict: 'love' }]
		);
		expect(weights['35']).toBeCloseTo(0.9, 10);
	});

	it('caps a repeatedly loved genre at 1.0', () => {
		const swipes = Array.from({ length: 10 }, (_, i) => ({
			tmdbId: i,
			mediaType: 'movie' as const,
			genreIds: [35],
			verdict: 'love' as const,
		}));
		const weights = buildOnboardingGenreWeights([35], swipes);
		expect(weights['35']).toBe(1);
	});

	it('floors a repeatedly not-for-me genre at 0.05, not 0', () => {
		const swipes = Array.from({ length: 10 }, (_, i) => ({
			tmdbId: i,
			mediaType: 'movie' as const,
			genreIds: [35],
			verdict: 'not_for_me' as const,
		}));
		const weights = buildOnboardingGenreWeights([], swipes);
		expect(weights['35']).toBe(0.05);
	});

	it('ignores a genre id outside the canonical GENRE_NAMES set', () => {
		const weights = buildOnboardingGenreWeights(
			[999999],
			[{ tmdbId: 1, mediaType: 'movie', genreIds: [999999], verdict: 'love' }]
		);
		expect(weights['999999']).toBeUndefined();
	});
});
