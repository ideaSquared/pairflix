import { buildCacheKey } from './llmCache.service';

describe('llmCache.buildCacheKey', () => {
	const base = {
		mood: 'chill',
		tasteProfileVersions: ['v1', 'v2'],
		candidates: [{ tmdb_id: 10 }, { tmdb_id: 20 }, { tmdb_id: 30 }],
	};

	it('buckets minutes to 15-minute steps (88 and 92 share a key)', () => {
		const k88 = buildCacheKey({ ...base, minutes: 88 });
		const k92 = buildCacheKey({ ...base, minutes: 92 });
		expect(k88).toBe(k92);
	});

	it('treats candidate order as irrelevant', () => {
		const sorted = buildCacheKey({ ...base, minutes: 90 });
		const shuffled = buildCacheKey({
			...base,
			minutes: 90,
			candidates: [{ tmdb_id: 30 }, { tmdb_id: 10 }, { tmdb_id: 20 }],
		});
		expect(sorted).toBe(shuffled);
	});

	it('differs when mood changes', () => {
		const a = buildCacheKey({ ...base, minutes: 90 });
		const b = buildCacheKey({ ...base, mood: 'tense', minutes: 90 });
		expect(a).not.toBe(b);
	});

	it('differs when taste profile versions change', () => {
		const a = buildCacheKey({ ...base, minutes: 90 });
		const b = buildCacheKey({
			...base,
			minutes: 90,
			tasteProfileVersions: ['v1', 'v3'],
		});
		expect(a).not.toBe(b);
	});
});
