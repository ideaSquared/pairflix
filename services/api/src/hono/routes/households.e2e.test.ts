import { env } from 'cloudflare:workers';
import { createDb, settings, subscriptions } from '@pairflix/db';
import { afterEach, describe, expect, it } from 'vitest';
import {
	callApp,
	createLoggedInUser,
	postJson,
	type Cookies,
} from '../test/test-helpers';

let counter = 0;
/** A fresh email per test -- isolated storage resets D1 between test *files*, not between tests
 * within one file. */
const uniqueEmail = () =>
	`households-e2e-${Date.now()}-${counter++}@example.com`;

type MockMovie = {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date: string;
	vote_average: number;
	vote_count: number;
	genre_ids: number[];
	popularity: number;
	runtime: number;
	providers?: {
		flatrate?: Array<{
			provider_id: number;
			provider_name: string;
			logo_path: string;
		}>;
	};
};

const MOVIE_A: MockMovie = {
	id: 101,
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
	id: 102,
	title: 'Laughs Ahead',
	overview: 'Another funny movie.',
	poster_path: null,
	release_date: '2019-01-01',
	vote_average: 7.0,
	vote_count: 400,
	genre_ids: [35],
	popularity: 40,
	runtime: 95,
	providers: {
		flatrate: [
			{ provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
		],
	},
};
const MOVIE_C: MockMovie = {
	id: 103,
	title: 'Chuckles',
	overview: 'A third comedy.',
	poster_path: null,
	release_date: '2021-01-01',
	vote_average: 6.5,
	vote_count: 300,
	genre_ids: [35],
	popularity: 30,
	runtime: 110,
};
const DEFAULT_MOVIES = [MOVIE_A, MOVIE_B, MOVIE_C];

const jsonResponse = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

type MockAnthropic =
	| { pickTmdbId: number; alternatesTmdbIds: number[]; rationale: string }
	| 'error';

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
});

/** Replaces the global fetch for the rest of the current test so pick/commit flows never hit the
 * real TMDb/Anthropic APIs -- unreachable from the test sandbox, and non-deterministic even if
 * reachable. Returns the list of URLs actually requested, so tests can assert on outgoing call
 * shape (e.g. proving the region-lock override reached TMDb). */
const mockExternalApis = (
	movies: MockMovie[],
	anthropic?: MockAnthropic
): string[] => {
	const capturedUrls: string[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: input.url;
		capturedUrls.push(url);
		const { hostname, pathname } = new URL(url);

		if (hostname === 'api.themoviedb.org') {
			if (pathname === '/3/discover/movie')
				return jsonResponse({ results: movies });
			const detail = /^\/3\/movie\/(\d+)$/.exec(pathname);
			if (detail) {
				const movie = movies.find(m => m.id === Number(detail[1]));
				if (!movie) return jsonResponse({}, 404);
				return jsonResponse({
					id: movie.id,
					title: movie.title,
					overview: movie.overview,
					poster_path: movie.poster_path,
					runtime: movie.runtime,
					release_date: movie.release_date,
				});
			}
			const providers = /^\/3\/movie\/(\d+)\/watch\/providers$/.exec(pathname);
			if (providers) {
				const movie = movies.find(m => m.id === Number(providers[1]));
				return jsonResponse({
					results: movie?.providers ? { GB: movie.providers } : {},
				});
			}
		}

		if (hostname === 'api.anthropic.com' && pathname === '/v1/messages') {
			if (anthropic === 'error')
				return jsonResponse({ error: 'mocked failure' }, 500);
			if (anthropic) {
				return jsonResponse({
					content: [
						{
							type: 'tool_use',
							name: 'submit_pick',
							input: {
								pick_tmdb_id: anthropic.pickTmdbId,
								alternates_tmdb_ids: anthropic.alternatesTmdbIds,
								rationale: anthropic.rationale,
							},
						},
					],
					usage: { input_tokens: 100, output_tokens: 50 },
				});
			}
		}

		throw new Error(`Unmocked fetch in test: ${url}`);
	}) as typeof fetch;
	return capturedUrls;
};

const createHousehold = async (
	cookies: Cookies,
	name?: string
): Promise<string> => {
	const result = await postJson<{ household: { id: string } }>(
		'/api/households',
		{ name },
		cookies
	);
	if (result.status !== 201) {
		throw new Error(
			`createHousehold failed: ${result.status} ${JSON.stringify(result.body)}`
		);
	}
	return result.body.household.id;
};

const makePremiumWithLlmRerank = async (householdId: string): Promise<void> => {
	const db = createDb(env.DB);
	const now = new Date();
	await db.insert(subscriptions).values({
		id: `sub_${householdId}`,
		householdId,
		tier: 'premium',
		status: 'active',
		currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
		createdAt: now,
		updatedAt: now,
	});
	await db
		.insert(settings)
		.values({
			key: 'recommendation.llm_rerank',
			value: true,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: settings.key,
			set: { value: true, updatedAt: now },
		});
};

describe('household CRUD + invites', () => {
	it('creates a household and lists it for the owner', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies, 'Our Household');

		const listed = await callApp<{
			households: Array<{ id: string; role: string }>;
		}>('/api/households', { cookies });
		expect(listed.status).toBe(200);
		expect(
			listed.body.households.some(
				h => h.id === householdId && h.role === 'owner'
			)
		).toBe(true);
	});

	it('rejects invite creation from a non-owner', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const other = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const result = await postJson(
			`/api/households/${householdId}/invites`,
			{},
			other.cookies
		);
		expect(result.status).toBe(403);
	});

	it('lets an owner invite another user, who can then accept and becomes a member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const invitee = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const invite = await postJson<{ invite: { token: string } }>(
			`/api/households/${householdId}/invites`,
			{},
			owner.cookies
		);
		expect(invite.status).toBe(201);

		const accept = await postJson<{ householdId: string }>(
			`/api/households/invites/${invite.body.invite.token}/accept`,
			{},
			invitee.cookies
		);
		expect(accept.status).toBe(200);
		expect(accept.body.householdId).toBe(householdId);

		const capturedUrls = mockExternalApis(DEFAULT_MOVIES);
		const pickResult = await postJson(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			invitee.cookies
		);
		expect(capturedUrls.length).toBeGreaterThan(0);
		expect(pickResult.status).toBe(200);
	});

	it('rejects accepting an invalid or expired invite token', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const result = await postJson(
			'/api/households/invites/not-a-real-token/accept',
			{},
			cookies
		);
		expect(result.status).toBe(410);
	});
});

describe('POST /api/households/:id/pick', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			outsider.cookies
		);
		expect(result.status).toBe(403);
	});

	it('returns a recommendation for a member and records a proposed pick event', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson<{
			pick: { tmdbId: number; mediaType: string };
			alternates: unknown[];
			rationale: string;
			score: number;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);

		expect(result.status).toBe(200);
		expect(DEFAULT_MOVIES.map(m => m.id)).toContain(result.body.pick.tmdbId);
		expect(result.body.pick.mediaType).toBe('movie');
		expect(typeof result.body.rationale).toBe('string');
		expect(result.body.rationale.length).toBeGreaterThan(0);

		const event = await env.DB.prepare(
			"SELECT kind, user_id FROM pick_events WHERE household_id = ?1 AND kind = 'proposed' ORDER BY occurred_at DESC LIMIT 1"
		)
			.bind(householdId)
			.first<{ kind: string; user_id: string }>();
		expect(event?.kind).toBe('proposed');
		expect(event?.user_id).toBe(userId);
	});

	it('enforces the free-tier daily pick quota', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		for (let i = 0; i < 3; i++) {
			mockExternalApis(DEFAULT_MOVIES);
			const ok = await postJson(
				`/api/households/${householdId}/pick`,
				{ mood: 'funny', minutes: 120 },
				cookies
			);
			expect(ok.status).toBe(200);
		}

		mockExternalApis(DEFAULT_MOVIES);
		const exceeded = await postJson<{ error: string }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(exceeded.status).toBe(402);
		expect(exceeded.body.error).toBe('pick_quota_exceeded');
	});

	it('silently overrides the region to the free-tier lock', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const capturedUrls = mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, region: 'US' },
			cookies
		);
		expect(result.status).toBe(200);

		const discoverCall = capturedUrls.find(u =>
			u.includes('/3/discover/movie')
		);
		expect(discoverCall).toBeDefined();
		expect(new URL(discoverCall!).searchParams.get('region')).toBe('GB');
	});

	it('only returns a candidate matching the requested provider', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, providers: ['Netflix'] },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.tmdbId).toBe(MOVIE_B.id);
	});

	it('returns 404 when every candidate is excluded', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/pick`,
			{
				mood: 'funny',
				minutes: 120,
				excludeTmdbIds: DEFAULT_MOVIES.map(m => m.id),
			},
			cookies
		);
		expect(result.status).toBe(404);
	});
});

describe('POST /api/households/:id/picks/:tmdbId/commit', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const result = await postJson(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie' },
			outsider.cookies
		);
		expect(result.status).toBe(403);
	});

	it('records watched-together and an accepted pick event', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await postJson<{ recorded: boolean; id: string }>(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(201);
		expect(result.body.recorded).toBe(true);

		const watched = await env.DB.prepare(
			'SELECT tmdb_id, media_type FROM watched_together WHERE id = ?1'
		)
			.bind(result.body.id)
			.first<{ tmdb_id: number; media_type: string }>();
		expect(watched?.tmdb_id).toBe(MOVIE_A.id);
		expect(watched?.media_type).toBe('movie');

		const event = await env.DB.prepare(
			"SELECT kind, user_id, tmdb_id FROM pick_events WHERE household_id = ?1 AND kind = 'accepted' ORDER BY occurred_at DESC LIMIT 1"
		)
			.bind(householdId)
			.first<{ kind: string; user_id: string; tmdb_id: number }>();
		expect(event?.kind).toBe('accepted');
		expect(event?.user_id).toBe(userId);
		expect(event?.tmdb_id).toBe(MOVIE_A.id);
	});
});

describe('LLM re-rank wiring', () => {
	it('never calls Anthropic when the flag is off (default)', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const capturedUrls = mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(
			capturedUrls.some(u => new URL(u).hostname === 'api.anthropic.com')
		).toBe(false);
	});

	it('uses the LLM pick and rationale when enabled and premium', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		await makePremiumWithLlmRerank(householdId);

		mockExternalApis(DEFAULT_MOVIES, {
			pickTmdbId: MOVIE_C.id,
			alternatesTmdbIds: [MOVIE_A.id],
			rationale: 'The LLM picked this one for a specific reason.',
		});
		const result = await postJson<{
			pick: { tmdbId: number };
			rationale: string;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.tmdbId).toBe(MOVIE_C.id);
		expect(result.body.rationale).toBe(
			'The LLM picked this one for a specific reason.'
		);
	});

	it('falls back to the ML pick when Anthropic fails', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		await makePremiumWithLlmRerank(householdId);

		mockExternalApis(DEFAULT_MOVIES, 'error');
		const result = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(DEFAULT_MOVIES.map(m => m.id)).toContain(result.body.pick.tmdbId);
	});
});
