import { describe, expect, it } from 'vitest';
import { denseGenreWeights, NEUTRAL_GENRE_WEIGHT } from './tasteWeights';
import { nudgeGenreWeights } from './tasteRecompute';

describe('nudgeGenreWeights', () => {
	it('nudges a rated genre toward 1.0 when enjoyed', () => {
		const next = nudgeGenreWeights(denseGenreWeights(), [35], true);
		// 0.35 * 0.75 + 1.0 * 0.25 = 0.5125
		expect(next['35']).toBeCloseTo(0.5125, 10);
	});

	it('nudges a rated genre toward 0.0 when not enjoyed', () => {
		const next = nudgeGenreWeights(denseGenreWeights(), [35], false);
		// 0.35 * 0.75 + 0.0 * 0.25 = 0.2625
		expect(next['35']).toBeCloseTo(0.2625, 10);
	});

	it('leaves genres not present on the rated title untouched', () => {
		const before = denseGenreWeights();
		const next = nudgeGenreWeights(before, [35], true);
		expect(next['18']).toBe(NEUTRAL_GENRE_WEIGHT);
		expect(next['27']).toBe(before['27']);
	});

	it('nudges every genre on a multi-genre title independently', () => {
		const next = nudgeGenreWeights(denseGenreWeights(), [35, 27], false);
		expect(next['35']).toBeCloseTo(0.2625, 10);
		expect(next['27']).toBeCloseTo(0.2625, 10);
		expect(next['18']).toBe(NEUTRAL_GENRE_WEIGHT);
	});

	it('converges toward the target with repeated updates', () => {
		let weights = denseGenreWeights();
		for (let i = 0; i < 50; i++) {
			weights = nudgeGenreWeights(weights, [35], true);
		}
		expect(weights['35']).toBeGreaterThan(0.99);
		expect(weights['35']).toBeLessThanOrEqual(1);
	});

	it('respects a custom alpha', () => {
		const next = nudgeGenreWeights(denseGenreWeights(), [35], true, 0.5);
		// 0.35 * 0.5 + 1.0 * 0.5 = 0.675
		expect(next['35']).toBeCloseTo(0.675, 10);
	});

	it('ignores a rated genre id outside the canonical GENRE_NAMES set', () => {
		const before = denseGenreWeights();
		const next = nudgeGenreWeights(before, [999999], true);
		expect(next).toEqual(before);
	});
});
