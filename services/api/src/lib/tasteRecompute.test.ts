import { describe, expect, it } from 'vitest';
import {
	denseEraWeights,
	denseGenreWeights,
	denseToneWeights,
	NEUTRAL_ERA_WEIGHT,
	NEUTRAL_GENRE_WEIGHT,
	NEUTRAL_TONE_WEIGHT,
} from './tasteWeights';
import {
	nudgeEraWeights,
	nudgeGenreWeights,
	nudgeRuntimePref,
	nudgeToneWeights,
} from './tasteRecompute';

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

describe('nudgeEraWeights', () => {
	it('nudges the rated era bucket toward 1.0 when enjoyed', () => {
		const next = nudgeEraWeights(denseEraWeights(), '2020s', true);
		// 0.35 * 0.75 + 1.0 * 0.25 = 0.5125
		expect(next['2020s']).toBeCloseTo(0.5125, 10);
	});

	it('nudges the rated era bucket toward 0.0 when not enjoyed', () => {
		const next = nudgeEraWeights(denseEraWeights(), '2020s', false);
		// 0.35 * 0.75 + 0.0 * 0.25 = 0.2625
		expect(next['2020s']).toBeCloseTo(0.2625, 10);
	});

	it('leaves every other era bucket untouched', () => {
		const before = denseEraWeights();
		const next = nudgeEraWeights(before, '2020s', true);
		expect(next['1990s']).toBe(NEUTRAL_ERA_WEIGHT);
		expect(next.pre1980).toBe(before.pre1980);
	});

	it('is a no-op when the era bucket is unknown (no year on the rated title)', () => {
		const before = denseEraWeights();
		const next = nudgeEraWeights(before, null, true);
		expect(next).toEqual(before);
	});
});

describe('nudgeToneWeights', () => {
	it('nudges the rated mood toward 1.0 when enjoyed', () => {
		const next = nudgeToneWeights(denseToneWeights(), 'funny', true);
		// 0.35 * 0.75 + 1.0 * 0.25 = 0.5125
		expect(next.funny).toBeCloseTo(0.5125, 10);
	});

	it('nudges the rated mood toward 0.0 when not enjoyed', () => {
		const next = nudgeToneWeights(denseToneWeights(), 'funny', false);
		// 0.35 * 0.75 + 0.0 * 0.25 = 0.2625
		expect(next.funny).toBeCloseTo(0.2625, 10);
	});

	it('leaves every other mood untouched', () => {
		const before = denseToneWeights();
		const next = nudgeToneWeights(before, 'funny', true);
		expect(next.dark).toBe(NEUTRAL_TONE_WEIGHT);
	});

	it('is a no-op when no mood was recorded at pick time', () => {
		const before = denseToneWeights();
		const next = nudgeToneWeights(before, null, true);
		expect(next).toEqual(before);
	});
});

describe('nudgeRuntimePref', () => {
	it('adopts the rated runtime outright when there is no prior estimate', () => {
		expect(nudgeRuntimePref(null, 100, true)).toBe(100);
	});

	it('EMA-nudges an existing estimate toward the rated runtime when enjoyed', () => {
		// 120 * 0.75 + 100 * 0.25 = 115
		expect(nudgeRuntimePref(120, 100, true)).toBeCloseTo(115, 10);
	});

	it('leaves the estimate untouched when not enjoyed -- no direction to move it in', () => {
		expect(nudgeRuntimePref(120, 100, false)).toBe(120);
		expect(nudgeRuntimePref(null, 100, false)).toBeNull();
	});

	it('leaves the estimate untouched when the rated title has no known runtime', () => {
		expect(nudgeRuntimePref(120, null, true)).toBe(120);
		expect(nudgeRuntimePref(null, null, true)).toBeNull();
	});
});
