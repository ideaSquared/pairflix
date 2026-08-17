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
		link?: string;
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
		link: 'https://www.themoviedb.org/movie/102/watch?locale=GB',
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

describe('GET /api/households/:id/history', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const result = await callApp(`/api/households/${householdId}/history`, {
			cookies: outsider.cookies,
		});
		expect(result.status).toBe(403);
	});

	it('returns an empty page when nothing has been watched yet', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await callApp<{
			data: unknown[];
			pagination: {
				page: number;
				limit: number;
				total: number;
				totalPages: number;
			};
		}>(`/api/households/${householdId}/history`, { cookies });
		expect(result.status).toBe(200);
		expect(result.body.data).toEqual([]);
		expect(result.body.pagination).toEqual({
			page: 1,
			limit: 20,
			total: 0,
			totalPages: 0,
		});
	});

	it('includes joined providers for a committed pick', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const providersLookup = await callApp(
			`/api/providers/${MOVIE_B.id}?mediaType=movie`,
			{ cookies }
		);
		expect(providersLookup.status).toBe(200);

		const commit = await postJson(
			`/api/households/${householdId}/picks/${MOVIE_B.id}/commit`,
			{ mediaType: 'movie' },
			cookies
		);
		expect(commit.status).toBe(201);

		const history = await callApp<{
			data: Array<{
				tmdbId: number;
				title: string | null;
				providers: { flatrate?: unknown[] };
			}>;
		}>(`/api/households/${householdId}/history`, { cookies });
		expect(history.status).toBe(200);
		expect(history.body.data).toHaveLength(1);
		expect(history.body.data[0]?.tmdbId).toBe(MOVIE_B.id);
		// Title is a placeholder ("Untitled movie") rather than MOVIE_B.title -- the provider-cache
		// write path never fetches real title/poster data (a pre-existing gap ported faithfully
		// from Express, see docs/roadmap.md). This test asserts the providers join, which is the
		// actual behavior this domain adds.
		expect(history.body.data[0]?.providers.flatrate?.length).toBeGreaterThan(0);
	});

	it('paginates', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		for (const movie of DEFAULT_MOVIES) {
			const commit = await postJson(
				`/api/households/${householdId}/picks/${movie.id}/commit`,
				{ mediaType: 'movie' },
				cookies
			);
			expect(commit.status).toBe(201);
		}

		const page1 = await callApp<{
			data: unknown[];
			pagination: { total: number; totalPages: number };
		}>(`/api/households/${householdId}/history?page=1&limit=2`, { cookies });
		expect(page1.status).toBe(200);
		expect(page1.body.data).toHaveLength(2);
		expect(page1.body.pagination.total).toBe(3);
		expect(page1.body.pagination.totalPages).toBe(2);

		const page2 = await callApp<{ data: unknown[] }>(
			`/api/households/${householdId}/history?page=2&limit=2`,
			{ cookies }
		);
		expect(page2.status).toBe(200);
		expect(page2.body.data).toHaveLength(1);
	});
});

describe('PATCH /api/households/:id/history/:watchedId', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie' },
			owner.cookies
		);

		const result = await postJson(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			outsider.cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(403);
	});

	it('sets and clears enjoyed', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie' },
			cookies
		);

		const thumbsUp = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(thumbsUp.status).toBe(200);
		expect(thumbsUp.body.entry.enjoyed).toBe(true);

		const cleared = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: null },
			cookies,
			{ method: 'PATCH' }
		);
		expect(cleared.status).toBe(200);
		expect(cleared.body.entry.enjoyed).toBeNull();
	});

	it('returns 404 for an unknown watchedId', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await postJson(
			`/api/households/${householdId}/history/not-a-real-id`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(404);
	});
});

describe('POST /api/households/:id/picks/:tmdbId/launch', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/picks/${MOVIE_B.id}/launch`,
			{ providerSlug: 'netflix', mediaType: 'movie' },
			outsider.cookies
		);
		expect(result.status).toBe(403);
	});

	it('resolves a deep link and records a provider_launched event', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson<{
			url: string;
			providerName: string;
			region: string;
		}>(
			`/api/households/${householdId}/picks/${MOVIE_B.id}/launch`,
			{ providerSlug: 'netflix', mediaType: 'movie' },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.providerName).toBe('Netflix');
		expect(result.body.url).toBe(MOVIE_B.providers?.link);
		expect(result.body.region).toBe('GB');

		const event = await env.DB.prepare(
			"SELECT kind, user_id, provider_slug FROM pick_events WHERE household_id = ?1 AND kind = 'provider_launched' ORDER BY occurred_at DESC LIMIT 1"
		)
			.bind(householdId)
			.first<{ kind: string; user_id: string; provider_slug: string }>();
		expect(event?.kind).toBe('provider_launched');
		expect(event?.user_id).toBe(userId);
		expect(event?.provider_slug).toBe('netflix');
	});

	it('returns 404 when the provider is not available', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/launch`,
			{ providerSlug: 'some_provider_not_offered', mediaType: 'movie' },
			cookies
		);
		expect(result.status).toBe(404);
	});
});

describe('POST /api/households/:id/pick-events', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const result = await postJson(
			`/api/households/${householdId}/pick-events`,
			{ tmdbId: MOVIE_A.id, mediaType: 'movie', kind: 'dismissed' },
			outsider.cookies
		);
		expect(result.status).toBe(403);
	});

	it('records a swapped or dismissed event', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await postJson<{ recorded: boolean; id: string }>(
			`/api/households/${householdId}/pick-events`,
			{ tmdbId: MOVIE_A.id, mediaType: 'movie', kind: 'dismissed' },
			cookies
		);
		expect(result.status).toBe(201);
		expect(result.body.recorded).toBe(true);
	});

	it('rejects a kind that has its own dedicated write path', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await postJson(
			`/api/households/${householdId}/pick-events`,
			{ tmdbId: MOVIE_A.id, mediaType: 'movie', kind: 'accepted' },
			cookies
		);
		expect(result.status).toBe(400);
	});
});

describe('GET /api/households/:id/pick-events/stats', () => {
	it('rejects a non-member', async () => {
		const owner = await createLoggedInUser(uniqueEmail());
		const outsider = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(owner.cookies);

		const result = await callApp(
			`/api/households/${householdId}/pick-events/stats`,
			{ cookies: outsider.cookies }
		);
		expect(result.status).toBe(403);
	});

	it('aggregates totals, acceptance rate, and provider clicks', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		await postJson(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie' },
			cookies
		);
		await postJson(
			`/api/households/${householdId}/pick-events`,
			{ tmdbId: MOVIE_C.id, mediaType: 'movie', kind: 'dismissed' },
			cookies
		);
		mockExternalApis(DEFAULT_MOVIES);
		await postJson(
			`/api/households/${householdId}/picks/${MOVIE_B.id}/launch`,
			{ providerSlug: 'netflix', mediaType: 'movie' },
			cookies
		);

		const stats = await callApp<{
			windowDays: number;
			totals: Record<string, number>;
			firstPickAcceptanceRate: number | null;
			providerClicksBySlug: Record<string, number>;
		}>(`/api/households/${householdId}/pick-events/stats`, { cookies });
		expect(stats.status).toBe(200);
		expect(stats.body.windowDays).toBe(30);
		expect(stats.body.totals.accepted).toBe(1);
		expect(stats.body.totals.dismissed).toBe(1);
		expect(stats.body.totals.provider_launched).toBe(1);
		expect(stats.body.firstPickAcceptanceRate).toBe(0.5);
		expect(stats.body.providerClicksBySlug.netflix).toBe(1);
	});
});

describe('GET /api/households/:id/entitlements', () => {
	it('rejects a non-member', async () => {
		const { cookies: ownerCookies } = await createLoggedInUser(uniqueEmail());
		const { cookies: outsiderCookies } =
			await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(ownerCookies);

		const result = await callApp(
			`/api/households/${householdId}/entitlements`,
			{
				cookies: outsiderCookies,
			}
		);
		expect(result.status).toBe(403);
	});

	it('returns free-tier defaults for a new household', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const result = await callApp<{
			tier: string;
			dailyPickLimit: number;
			canUseMultiRegion: boolean;
		}>(`/api/households/${householdId}/entitlements`, { cookies });
		expect(result.status).toBe(200);
		expect(result.body.tier).toBe('free');
		expect(result.body.dailyPickLimit).toBe(3);
		expect(result.body.canUseMultiRegion).toBe(false);
	});
});

describe('billing routes', () => {
	it('POST /:id/billing/checkout is owner-only and returns a checkout URL', async () => {
		const { cookies: ownerCookies } = await createLoggedInUser(uniqueEmail());
		const { cookies: memberCookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(ownerCookies);
		const invite = await postJson<{ invite: { token: string } }>(
			`/api/households/${householdId}/invites`,
			{},
			ownerCookies
		);
		await postJson(
			`/api/households/invites/${invite.body.invite.token}/accept`,
			{},
			memberCookies
		);

		const asMember = await postJson(
			`/api/households/${householdId}/billing/checkout`,
			{},
			memberCookies
		);
		expect(asMember.status).toBe(403);

		const asOwner = await postJson<{ checkoutUrl: string }>(
			`/api/households/${householdId}/billing/checkout`,
			{},
			ownerCookies
		);
		expect(asOwner.status).toBe(200);
		expect(asOwner.body.checkoutUrl).toContain(householdId);
	});

	it('mock-activate flips the household to premium, cancel reverts it', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		const activated = await postJson(
			`/api/households/${householdId}/billing/mock-activate`,
			{},
			cookies
		);
		expect(activated.status).toBe(200);

		const afterActivate = await callApp<{
			tier: string;
			canUseMultiRegion: boolean;
		}>(`/api/households/${householdId}/entitlements`, { cookies });
		expect(afterActivate.body.tier).toBe('premium');
		expect(afterActivate.body.canUseMultiRegion).toBe(true);

		const canceled = await postJson(
			`/api/households/${householdId}/billing/cancel`,
			{},
			cookies
		);
		expect(canceled.status).toBe(204);

		const afterCancel = await callApp<{ tier: string }>(
			`/api/households/${householdId}/entitlements`,
			{ cookies }
		);
		expect(afterCancel.body.tier).toBe('free');
	});
});
