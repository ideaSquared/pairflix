import { describe, expect, it } from 'vitest';
import {
	callApp,
	mockExternalApis,
	uniqueIp,
	type MockMovie,
} from '../test/test-helpers';

const MOVIE_A: MockMovie = {
	id: 901,
	title: 'The Comedy Hour',
	overview: 'A very funny movie.',
	poster_path: null,
	release_date: '2020-01-01',
	vote_average: 7.5,
	vote_count: 500,
	genre_ids: [35],
	popularity: 50,
	runtime: 100,
};
const MOVIE_B: MockMovie = {
	id: 902,
	title: 'Laughs Ahead',
	overview: 'Another funny movie.',
	poster_path: null,
	release_date: '2019-01-01',
	vote_average: 7.0,
	vote_count: 400,
	genre_ids: [35],
	popularity: 40,
	runtime: 95,
};
const DEFAULT_MOVIES = [MOVIE_A, MOVIE_B];

const demoPick = (ip: string, body: unknown) =>
	callApp<{
		pick?: { tmdbId: number; mediaType: string };
		rationale?: string;
		error?: string;
	}>('/api/demo/pick', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		ip,
	});

describe('POST /api/demo/pick', () => {
	it('returns a recommendation with no cookies/session at all', async () => {
		mockExternalApis(DEFAULT_MOVIES);
		const result = await demoPick(uniqueIp(), { mood: 'funny', minutes: 120 });

		expect(result.status).toBe(200);
		expect(DEFAULT_MOVIES.map(m => m.id)).toContain(result.body.pick?.tmdbId);
		expect(result.body.pick?.mediaType).toBe('movie');
		expect(typeof result.body.rationale).toBe('string');
		expect(result.body.rationale?.length ?? 0).toBeGreaterThan(0);
	});

	it('returns 404 when no candidates match', async () => {
		mockExternalApis([]);
		const result = await demoPick(uniqueIp(), { mood: 'funny', minutes: 120 });

		expect(result.status).toBe(404);
		expect(result.body.error).toBe('No candidates found for these inputs');
	});

	it('rate-limits repeated calls from the same IP', async () => {
		const ip = uniqueIp();
		for (let i = 0; i < 3; i++) {
			mockExternalApis(DEFAULT_MOVIES);
			const ok = await demoPick(ip, { mood: 'funny', minutes: 120 });
			expect(ok.status).toBe(200);
		}

		mockExternalApis(DEFAULT_MOVIES);
		const limited = await demoPick(ip, { mood: 'funny', minutes: 120 });
		expect(limited.status).toBe(429);
		expect(limited.body.error).toBe('Too many requests');
	});
});
