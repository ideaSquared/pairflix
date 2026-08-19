import { describe, expect, it } from 'vitest';
import { ERA_BUCKETS } from './eras';
import { GENRE_NAMES } from './genres';
import {
	NEUTRAL_ERA_WEIGHT,
	NEUTRAL_GENRE_WEIGHT,
	NEUTRAL_TONE_WEIGHT,
	denseEraWeights,
	denseGenreWeights,
	denseToneWeights,
} from './tasteWeights';

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

describe('denseEraWeights', () => {
	it('fills every ERA_BUCKETS key at the neutral weight when given nothing', () => {
		const dense = denseEraWeights();
		expect(Object.keys(dense)).toHaveLength(ERA_BUCKETS.length);
		for (const bucket of ERA_BUCKETS) {
			expect(dense[bucket]).toBe(NEUTRAL_ERA_WEIGHT);
		}
	});

	it('preserves existing values and only fills in what is missing', () => {
		const dense = denseEraWeights({ '2020s': 0.9 });
		expect(dense['2020s']).toBe(0.9);
		expect(dense['1990s']).toBe(NEUTRAL_ERA_WEIGHT);
		expect(Object.keys(dense)).toHaveLength(ERA_BUCKETS.length);
	});
});

describe('denseToneWeights', () => {
	it('fills every mood at the neutral weight when given nothing', () => {
		const dense = denseToneWeights();
		expect(dense.funny).toBe(NEUTRAL_TONE_WEIGHT);
		expect(dense.dark).toBe(NEUTRAL_TONE_WEIGHT);
		expect(Object.keys(dense)).toHaveLength(7);
	});

	it('preserves existing values and only fills in what is missing', () => {
		const dense = denseToneWeights({ funny: 0.9 });
		expect(dense.funny).toBe(0.9);
		expect(dense.dark).toBe(NEUTRAL_TONE_WEIGHT);
	});
});
