import { describe, expect, it } from 'vitest';
import {
	MOOD_FILTERS,
	TV_ACTION_ADVENTURE_GENRE_ID,
	TV_COMPATIBLE_GENRE_IDS,
	toMovieGenreIds,
} from './genres';

describe('toMovieGenreIds', () => {
	it('expands the TV Action & Adventure id into its two movie ids', () => {
		expect(toMovieGenreIds([TV_ACTION_ADVENTURE_GENRE_ID])).toEqual([28, 12]);
	});

	it('passes movie-space ids through unchanged (no-op on a movie genre list)', () => {
		expect(toMovieGenreIds([35, 18, 80])).toEqual([35, 18, 80]);
	});

	it('expands in place while preserving surrounding ids and order', () => {
		expect(toMovieGenreIds([80, TV_ACTION_ADVENTURE_GENRE_ID, 18])).toEqual([
			80, 28, 12, 18,
		]);
	});

	it('returns an empty array unchanged', () => {
		expect(toMovieGenreIds([])).toEqual([]);
	});
});

describe('MOOD_FILTERS', () => {
	it('covers every mood with at least one genre id', () => {
		for (const [mood, filter] of Object.entries(MOOD_FILTERS)) {
			expect(filter.genres.length, mood).toBeGreaterThan(0);
			expect(filter.label.length, mood).toBeGreaterThan(0);
		}
	});
});

describe('TV_COMPATIBLE_GENRE_IDS', () => {
	it('excludes the movie-only genres TV has no equivalent for (horror, romance, thriller)', () => {
		expect(TV_COMPATIBLE_GENRE_IDS.has(27)).toBe(false);
		expect(TV_COMPATIBLE_GENRE_IDS.has(10749)).toBe(false);
		expect(TV_COMPATIBLE_GENRE_IDS.has(53)).toBe(false);
		// Crime (80) is shared, which is why the `dark` mood stays TV-eligible.
		expect(TV_COMPATIBLE_GENRE_IDS.has(80)).toBe(true);
	});
});
