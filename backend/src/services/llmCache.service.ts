import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

import type { LlmCandidate, LlmRerankResult } from './llm.types';

const CACHE_MAX = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const cache = new LRUCache<string, LlmRerankResult>({
	max: CACHE_MAX,
	ttl: CACHE_TTL_MS,
});

export interface CacheKeyInput {
	mood: string;
	minutes: number;
	candidates: Pick<LlmCandidate, 'tmdb_id'>[];
	tasteProfileVersions: string[];
}

export function buildCacheKey(input: CacheKeyInput): string {
	// Bucket minutes to 15-min buckets and sort candidate IDs so cosmetic
	// differences (88 vs 92 min; candidate order) hit the same cache entry.
	const minutes_bucket = Math.round(input.minutes / 15) * 15;
	const candidate_tmdb_ids_sorted = input.candidates
		.map(c => c.tmdb_id)
		.slice()
		.sort((a, b) => a - b);
	const taste_profile_versions = input.tasteProfileVersions.slice().sort();

	const payload = JSON.stringify({
		mood: input.mood,
		minutes_bucket,
		candidate_tmdb_ids_sorted,
		taste_profile_versions,
	});

	return crypto.createHash('sha256').update(payload).digest('hex');
}

export function get(key: string): LlmRerankResult | null {
	return cache.get(key) ?? null;
}

export function set(key: string, value: LlmRerankResult): void {
	cache.set(key, value);
}

export function clear(): void {
	cache.clear();
}

export const llmCacheService = {
	buildCacheKey,
	get,
	set,
	clear,
};
