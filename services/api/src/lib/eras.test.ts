import { describe, expect, it } from 'vitest';
import { ERA_BUCKETS, eraBucketForYear } from './eras';

describe('eraBucketForYear', () => {
	it('maps years to the expected bucket at each boundary', () => {
		// Each pair is [lower edge, upper edge] of a bucket's inclusive range.
		expect(eraBucketForYear(1900)).toBe('pre1980');
		expect(eraBucketForYear(1979)).toBe('pre1980');
		expect(eraBucketForYear(1980)).toBe('1980s');
		expect(eraBucketForYear(1989)).toBe('1980s');
		expect(eraBucketForYear(1990)).toBe('1990s');
		expect(eraBucketForYear(1999)).toBe('1990s');
		expect(eraBucketForYear(2000)).toBe('2000s');
		expect(eraBucketForYear(2009)).toBe('2000s');
		expect(eraBucketForYear(2010)).toBe('2010s');
		expect(eraBucketForYear(2019)).toBe('2010s');
		expect(eraBucketForYear(2020)).toBe('2020s');
		expect(eraBucketForYear(2999)).toBe('2020s');
	});

	it('only ever returns a bucket in the fixed vocabulary', () => {
		for (const year of [1850, 1985, 1995, 2005, 2015, 2025, 3000]) {
			expect(ERA_BUCKETS).toContain(eraBucketForYear(year));
		}
	});
});
