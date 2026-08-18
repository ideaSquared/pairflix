import { describe, expect, it } from 'vitest';
import { GENRE_NAMES } from './genres';
import { NEUTRAL_GENRE_WEIGHT, denseGenreWeights } from './tasteWeights';

describe('denseGenreWeights', () => {
	it('fills every GENRE_NAMES id at the neutral weight when given nothing', () => {
		const dense = denseGenreWeights();
		const genreIds = Object.keys(GENRE_NAMES);
		expect(Object.keys(dense)).toHaveLength(genreIds.length);
		for (const id of genreIds) {
			expect(dense[id]).toBe(NEUTRAL_GENRE_WEIGHT);
		}
	});

	it('preserves existing values and only fills in what is missing', () => {
		const dense = denseGenreWeights({ '35': 0.9 });
		expect(dense['35']).toBe(0.9);
		expect(dense['18']).toBe(NEUTRAL_GENRE_WEIGHT);
		expect(Object.keys(dense)).toHaveLength(Object.keys(GENRE_NAMES).length);
	});
});
