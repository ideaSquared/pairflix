import { env } from 'cloudflare:workers';
import { createDb, settings, subscriptions } from '@pairflix/db';
import { describe, expect, it } from 'vitest';
import {
	callApp,
	createLoggedInUser,
	getCsrfToken,
	mockExternalApis,
	postJson,
	type Cookies,
	type MockAnthropic,
	type MockMovie,
	type MockShow,
} from '../test/test-helpers';

let counter = 0;
/** A fresh email per test -- isolated storage resets D1 between test *files*, not between tests
 * within one file. */
const uniqueEmail = () =>
	`households-e2e-${Date.now()}-${counter++}@example.com`;

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

// A 5-title pool for the provider-starvation test below. Same genre/runtime throughout (so
// genreMatch/runtimeFit stay constant for a fresh household) and release years spread out so score
// -- driven entirely by recencyBonus/eraMatch here -- ranks them strictly A > B > C > D > E. Only B
// and E carry a Netflix entry; with a free-tier household's hydrateCount of 3, B sits inside the
// first hydrated batch but E only surfaces once B is watched and excluded and the search widens
// into the next batch.
const STARVE_MOVIE_A: MockMovie = {
	id: 601,
	title: 'Newest, No Provider',
	overview: 'Ranks first on recency; no provider data.',
	poster_path: null,
	release_date: '2023-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 50,
	runtime: 110,
};
const STARVE_MOVIE_B: MockMovie = {
	id: 602,
	title: 'Second Newest, Netflix',
	overview: 'Ranks second on recency; the only Netflix title in the top 3.',
	poster_path: null,
	release_date: '2022-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 50,
	runtime: 110,
	providers: {
		flatrate: [
			{ provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
		],
		link: 'https://www.themoviedb.org/movie/602/watch?locale=GB',
	},
};
const STARVE_MOVIE_C: MockMovie = {
	id: 603,
	title: 'Third Newest, No Provider',
	overview: 'Ranks third on recency; no provider data.',
	poster_path: null,
	release_date: '2021-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 50,
	runtime: 110,
};
const STARVE_MOVIE_D: MockMovie = {
	id: 604,
	title: 'Fourth Newest, No Provider',
	overview: 'Ranks fourth on recency; no provider data.',
	poster_path: null,
	release_date: '2020-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 50,
	runtime: 110,
};
const STARVE_MOVIE_E: MockMovie = {
	id: 605,
	title: 'Oldest, Netflix',
	overview:
		'Ranks fifth (last) on recency; the pool-wide only remaining Netflix title.',
	poster_path: null,
	release_date: '2019-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 50,
	runtime: 110,
	providers: {
		flatrate: [
			{ provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
		],
		link: 'https://www.themoviedb.org/movie/605/watch?locale=GB',
	},
};
const STARVE_MOVIES = [
	STARVE_MOVIE_A,
	STARVE_MOVIE_B,
	STARVE_MOVIE_C,
	STARVE_MOVIE_D,
	STARVE_MOVIE_E,
];

// A deliberately-mismatched pair for the runtime re-ranking test below: OLD_GOOD_RUNTIME scores
// lower pre-hydration (older, so a smaller recencyBonus) but has a real runtime close to the
// gaussian peak for a 120-minute request; NEW_BAD_RUNTIME scores higher pre-hydration (brand new,
// full recencyBonus) but its real runtime is far too short. Pre-hydration scoring can't see either
// runtime (uses a neutral 0.5 for both), so it ranks NEW_BAD_RUNTIME first; only a re-score after
// hydration (once real runtime is known) can correct that.
const OLD_GOOD_RUNTIME_MOVIE: MockMovie = {
	id: 301,
	title: 'The Right Length',
	overview: 'An older movie with a great runtime fit.',
	poster_path: null,
	release_date: '2015-01-01',
	vote_average: 6.0,
	vote_count: 250,
	genre_ids: [35],
	popularity: 20,
	runtime: 112,
};
const NEW_BAD_RUNTIME_MOVIE: MockMovie = {
	id: 302,
	title: 'Too Short',
	overview: 'A brand-new movie that runs far too short.',
	poster_path: null,
	release_date: '2026-01-01',
	vote_average: 6.0,
	vote_count: 250,
	genre_ids: [35],
	popularity: 20,
	runtime: 20,
};

// A separate movie purely for seeding an era preference in the "learned era can flip the winner"
// test below -- rating it (rather than OLD_ERA_MOVIE itself) means the two actual candidates stay
// unwatched and so still eligible for the second pick.
const RATED_OLD_ERA_MOVIE: MockMovie = {
	id: 400,
	title: 'Something From That Decade',
	overview:
		'Rated to seed an era preference; not itself offered as a candidate afterward.',
	poster_path: null,
	release_date: '2015-06-01',
	vote_average: 6.0,
	vote_count: 250,
	genre_ids: [35],
	popularity: 15,
	runtime: 105,
};
// Same genre/runtime/mood-fit -- differ only by release year, so the default recency bias decides
// the "before" pick and a learned era preference (seeded by rating RATED_OLD_ERA_MOVIE, same era
// bucket as this one) has to outweigh that same recency bias to decide the "after" pick.
const OLD_ERA_MOVIE: MockMovie = {
	id: 401,
	title: 'A Decade Past',
	overview: 'An older movie, otherwise a strong match.',
	poster_path: null,
	release_date: '2015-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 25,
	runtime: 110,
};
const NEW_ERA_MOVIE: MockMovie = {
	id: 402,
	title: 'Fresh Off the Press',
	overview: 'A brand-new movie, otherwise an equally strong match.',
	poster_path: null,
	release_date: '2022-01-01',
	vote_average: 7.0,
	vote_count: 300,
	genre_ids: [35],
	popularity: 25,
	runtime: 110,
};

const SHOW_A: MockShow = {
	id: 201,
	name: 'The Improv Hour',
	overview: 'A very funny show.',
	poster_path: null,
	// Much more recent than DEFAULT_MOVIES (2019-2021) -- guarantees a strictly higher
	// recencyBonus, so tests can assert this show wins the pick deterministically.
	first_air_date: '2026-01-01',
	vote_average: 8.0,
	vote_count: 600,
	genre_ids: [35],
	popularity: 60,
	// Close to DEFAULT_MOVIES' runtimes (95-110), not a real half-hour-comedy episode length --
	// keeps this fixture winning on recencyBonus specifically in tests that use a ~120-minute
	// request, isolated from the real-runtime re-ranking covered by its own test below.
	episode_run_time: [112],
};

// dark's other genre (thriller, 53) has no TV equivalent, but this one (crime, 80) does -- same
// recency-driven win pattern as SHOW_A, just proving TV eligibility now only needs one of dark's
// two genres to match instead of both.
const SHOW_DARK: MockShow = {
	id: 202,
	name: 'The Precinct',
	overview: 'A dark TV crime drama.',
	poster_path: null,
	first_air_date: '2026-01-01',
	vote_average: 8.0,
	vote_count: 600,
	genre_ids: [80],
	popularity: 60,
	episode_run_time: [112],
};

// Fixtures for the "action mood recognizes TV's Action & Adventure id" test below. Rated (not
// offered as a candidate) purely to seed a household genre/tone preference before the real
// comparison -- its own era bucket (1980s) is deliberately far from the two candidates' (2010s) so
// its era nudge can't touch either of them.
const RATED_ACTION_MOVIE: MockMovie = {
	id: 501,
	title: 'Explosive Pursuit',
	overview:
		'Rated to seed an action genre/tone preference; not itself a candidate afterward.',
	poster_path: null,
	release_date: '1985-06-01',
	vote_average: 6.5,
	vote_count: 300,
	genre_ids: [28],
	popularity: 20,
	runtime: 100,
};
// Same release year (era bucket) and runtime as COMEDY_MOVIE_SAME_ERA below -- recencyBonus,
// eraPref, and runtimeFit are all identical between the two, so only genre-based scoring
// (genreMatch, genreMoodHit) can decide which one wins.
const SHOW_ACTION: MockShow = {
	id: 502,
	name: 'Chase Protocol',
	overview: 'A TV action/adventure series.',
	poster_path: null,
	first_air_date: '2015-06-15',
	vote_average: 7.5,
	vote_count: 400,
	// TMDb's real TV genre for this -- not [28, 12], which don't exist in TV's taxonomy.
	genre_ids: [10759],
	popularity: 45,
	episode_run_time: [105],
};
const COMEDY_MOVIE_SAME_ERA: MockMovie = {
	id: 503,
	title: 'Sitcom Reruns',
	overview: 'An unrelated comedy, matched on every dimension except genre.',
	poster_path: null,
	release_date: '2015-01-01',
	vote_average: 7.5,
	vote_count: 400,
	genre_ids: [35],
	popularity: 45,
	runtime: 105,
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

/** Polls until `query` returns a truthy row or `timeoutMs` elapses. `recomputeTasteFromRating`
 * (lib/tasteRecompute.ts) runs via `waitUntil` -- fire-and-forget, matching
 * `recordPickEvent`/`reserveDailyPick`'s release -- so unlike a direct `await`ed write, its D1
 * write isn't guaranteed to have landed the instant the triggering request's response resolves. */
const waitForRow = async <T>(
	query: () => Promise<T | null | undefined>,
	timeoutMs = 2000
): Promise<T> => {
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		const row = await query();
		if (row) return row;
		if (Date.now() >= deadline) throw new Error('Timed out waiting for row');
		await new Promise(resolve => setTimeout(resolve, 25));
	}
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

	it('allows at most one success when two picks race with one remaining', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		for (let i = 0; i < 2; i++) {
			mockExternalApis(DEFAULT_MOVIES);
			const ok = await postJson(
				`/api/households/${householdId}/pick`,
				{ mood: 'funny', minutes: 120 },
				cookies
			);
			expect(ok.status).toBe(200);
		}

		// Exactly 1 of the free tier's 3 daily picks remains. Fire two requests genuinely
		// concurrently (same pre-seeded CSRF cookie/token, no sequential await between them) to
		// exercise the race a sequential loop can't reach -- the quota check must be atomic with the
		// usage write, not a read-then-later-write, or both could pass the check before either write
		// lands.
		mockExternalApis(DEFAULT_MOVIES);
		const seeded = await getCsrfToken(cookies);
		const raceInit = {
			method: 'POST' as const,
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-token': seeded.csrfToken,
			},
			body: JSON.stringify({ mood: 'funny', minutes: 120 }),
			cookies: seeded.cookies,
		};
		const [first, second] = await Promise.all([
			callApp(`/api/households/${householdId}/pick`, raceInit),
			callApp(`/api/households/${householdId}/pick`, raceInit),
		]);

		const statuses = [first.status, second.status].sort((a, b) => a - b);
		expect(statuses).toEqual([200, 402]);

		const picksToday = await env.DB.prepare(
			'SELECT COUNT(*) as total FROM pick_usage WHERE household_id = ?1'
		)
			.bind(householdId)
			.first<{ total: number }>();
		expect(picksToday?.total).toBe(3);
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

	it('still 404s once every candidate in the pool has been watched or lacks the provider', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// MOVIE_B is DEFAULT_MOVIES' only Netflix-provider title, so the first pick finds it. Once
		// it's committed (watched-together), the whole 3-title pool is exhausted -- A and C carry no
		// provider data in this fixture -- so a genuine "nothing left to match" 404 is still correct,
		// unlike the starvation case covered below where a match exists further down the ranked pool.
		mockExternalApis(DEFAULT_MOVIES);
		const first = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, providers: ['Netflix'] },
			cookies
		);
		expect(first.status).toBe(200);
		expect(first.body.pick.tmdbId).toBe(MOVIE_B.id);

		mockExternalApis(DEFAULT_MOVIES);
		const commit = await postJson(
			`/api/households/${householdId}/picks/${MOVIE_B.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);

		mockExternalApis(DEFAULT_MOVIES);
		const second = await postJson<{ error: string }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, providers: ['Netflix'] },
			cookies
		);
		expect(second.status).toBe(404);
		expect(second.body.error).toBe('No candidates matched the provider filter');
	});

	it('widens past the top-hydrateCount window to find a provider match further down the pool', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// STARVE_MOVIE_B (rank 2) is the only Netflix title inside the free tier's top-3 hydration
		// window, so the first pick finds it there.
		mockExternalApis(STARVE_MOVIES);
		const first = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, providers: ['Netflix'] },
			cookies
		);
		expect(first.status).toBe(200);
		expect(first.body.pick.tmdbId).toBe(STARVE_MOVIE_B.id);

		mockExternalApis(STARVE_MOVIES);
		const commit = await postJson(
			`/api/households/${householdId}/picks/${STARVE_MOVIE_B.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);

		// Once B is watched-together (excluded), the new top 3 by recency is A, C, D -- none carry
		// Netflix. Only E (rank 5, outside the top-3 window) still does. Without widening past the
		// initial hydrated batch this 404s as "No candidates matched the provider filter" even though
		// a real match exists further down the same ranked pool.
		mockExternalApis(STARVE_MOVIES);
		const second = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120, providers: ['Netflix'] },
			cookies
		);
		expect(second.status).toBe(200);
		expect(second.body.pick.tmdbId).toBe(STARVE_MOVIE_E.id);
	});

	it('fetches provider data for display even without a providers filter', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const result = await postJson<{
			pick: {
				tmdbId: number;
				providers: { flatrate?: Array<{ provider_name: string }> };
			};
		}>(
			`/api/households/${householdId}/pick`,
			// No `providers` filter at all -- excluding A and C leaves B (the only mocked movie with
			// provider data) as the sole candidate, so the pick is deterministic without a filter.
			{
				mood: 'funny',
				minutes: 120,
				excludeTmdbIds: [MOVIE_A.id, MOVIE_C.id],
			},
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.tmdbId).toBe(MOVIE_B.id);
		expect(result.body.pick.providers.flatrate?.[0]?.provider_name).toBe(
			'Netflix'
		);
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

	it('refunds the daily quota when a pick fails, so a failed attempt costs nothing', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const failed = await postJson(
			`/api/households/${householdId}/pick`,
			{
				mood: 'funny',
				minutes: 120,
				excludeTmdbIds: DEFAULT_MOVIES.map(m => m.id),
			},
			cookies
		);
		expect(failed.status).toBe(404);

		// The reservation is released via waitUntil after the response resolves -- wait for the row
		// to actually clear before spending the real quota, or the poll below races the release.
		await waitForRow(async () => {
			const row = await env.DB.prepare(
				'SELECT COUNT(*) AS n FROM pick_usage WHERE household_id = ?1'
			)
				.bind(householdId)
				.first<{ n: number }>();
			return row?.n === 0 ? row : null;
		});

		// All three free-tier picks still succeed -- the failed attempt did not consume one.
		for (let i = 0; i < 3; i++) {
			mockExternalApis(DEFAULT_MOVIES);
			const ok = await postJson(
				`/api/households/${householdId}/pick`,
				{ mood: 'funny', minutes: 120 },
				cookies
			);
			expect(ok.status).toBe(200);
		}
	});
});

describe('CSRF protection', () => {
	it('rejects a state-changing request that carries a session cookie but no CSRF header', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const result = await callApp('/api/households', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'No CSRF' }),
			cookies,
		});
		expect(result.status).toBe(403);
	});

	it('rejects a state-changing request whose CSRF header does not match the cookie', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const seeded = await getCsrfToken(cookies);
		const result = await callApp('/api/households', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-csrf-token': 'not-the-real-token',
			},
			body: JSON.stringify({ name: 'Wrong CSRF' }),
			cookies: seeded.cookies,
		});
		expect(result.status).toBe(403);
	});
});

describe('POST /api/households/:id/pick -- TV candidates', () => {
	it('can win the pick under a TV-compatible mood', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES, undefined, [SHOW_A]);
		const result = await postJson<{
			pick: { tmdbId: number; mediaType: string };
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.mediaType).toBe('tv');
		expect(result.body.pick.tmdbId).toBe(SHOW_A.id);
	});

	it('dark mood can win the pick via TV on a partial genre match (crime, not thriller)', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// DEFAULT_MOVIES are all genre 35 (comedy) -- a full mismatch against dark's [80, 53], so
		// SHOW_DARK (genre 80) wins on both genre match and recency, proving tvEligible now queries
		// TV for dark even though only one of its two genres (crime) has a TV equivalent.
		mockExternalApis(DEFAULT_MOVIES, undefined, [SHOW_DARK]);
		const result = await postJson<{
			pick: { tmdbId: number; mediaType: string };
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'dark', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.mediaType).toBe('tv');
		expect(result.body.pick.tmdbId).toBe(SHOW_DARK.id);
	});

	it('never queries TV for a mood outside the TV-compatible genre set', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// romantic mood's only genre (10749, romance) has no TV equivalent at all -- see
		// TV_COMPATIBLE_GENRE_IDS.
		const capturedUrls = mockExternalApis(DEFAULT_MOVIES, undefined, [SHOW_A]);
		const result = await postJson(
			`/api/households/${householdId}/pick`,
			{ mood: 'romantic', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(capturedUrls.some(u => u.includes('/3/discover/tv'))).toBe(false);
	});

	it('recognizes TV Action & Adventure (10759) as the action mood, not just fetches it', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// Seed an action genre/tone preference -- SHOW_ACTION and COMEDY_MOVIE_SAME_ERA are
		// identical on every other scored dimension (era bucket, runtime), so only genre-based
		// scoring can decide the winner below. If TV's genre id (10759) weren't correctly mapped
		// back to the movie ids (28, 12) this preference is keyed by, SHOW_ACTION would score a
		// flat 0 on both genreMatch and the genre half of moodHit and lose easily instead.
		mockExternalApis([RATED_ACTION_MOVIE]);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${RATED_ACTION_MOVIE.id}/commit`,
			{ mediaType: 'movie', mood: 'action', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);
		const patch = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(patch.status).toBe(200);
		await waitForRow(() =>
			env.DB.prepare('SELECT weights FROM taste_profiles WHERE user_id = ?1')
				.bind(userId)
				.first<{ weights: string }>()
		);

		mockExternalApis([COMEDY_MOVIE_SAME_ERA], undefined, [SHOW_ACTION]);
		const result = await postJson<{
			pick: { tmdbId: number; mediaType: string };
			rationale: string;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'action', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.mediaType).toBe('tv');
		expect(result.body.pick.tmdbId).toBe(SHOW_ACTION.id);
		// buildRationale reads the pick's own genre_ids too -- proves the id-remap reaches it, not
		// just scoreCandidate, or this would fall back to the generic "matches your mood" text.
		expect(result.body.rationale).toContain('action');
	});

	it('rating a TV action/adventure title nudges the movie action/adventure genre weights', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// cacheContentDetails (called from commitPick) persists content.genreIds from TMDb's raw TV
		// response -- [10759], not [28, 12]. Without normalizing it the same way pickForHousehold's
		// in-memory candidates are, recomputeTasteFromRating's nudgeGenreWeights would silently skip
		// this rating entirely (10759 isn't a key in GENRE_NAMES), and neither weight would move.
		mockExternalApis([], undefined, [SHOW_ACTION]);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${SHOW_ACTION.id}/commit`,
			{ mediaType: 'tv', mood: 'action', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);
		const patch = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(patch.status).toBe(200);

		const profileRow = await waitForRow(() =>
			env.DB.prepare('SELECT weights FROM taste_profiles WHERE user_id = ?1')
				.bind(userId)
				.first<{ weights: string }>()
		);
		const weights = JSON.parse(profileRow.weights) as {
			genres: Record<string, number>;
		};
		// Same EMA-from-neutral math as the movie case (0.35 * 0.75 + 1.0 * 0.25 = 0.5125) -- both
		// ids nudge independently, since nudgeGenreWeights loops every rated genre id on its own.
		expect(weights.genres['28']).toBeCloseTo(0.5125, 5);
		expect(weights.genres['12']).toBeCloseTo(0.5125, 5);
		expect(weights.genres['35']).toBeCloseTo(0.35, 5);
	});

	it('does not exclude a TV candidate whose id matches a watched movie', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		await postJson(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);

		// Movie and TV tmdb ids come from separate TMDb id spaces, so a TV show legitimately
		// sharing MOVIE_A's numeric id is a real (if coincidental) scenario, not a malformed
		// fixture -- the watched-together exclusion must key on tmdbId+mediaType, not tmdbId alone.
		const showSharingId: MockShow = { ...SHOW_A, id: MOVIE_A.id };
		mockExternalApis(DEFAULT_MOVIES, undefined, [showSharingId]);
		const result = await postJson<{
			pick: { tmdbId: number; mediaType: string };
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.mediaType).toBe('tv');
		expect(result.body.pick.tmdbId).toBe(MOVIE_A.id);
	});
});

describe('POST /api/households/:id/pick -- runtime-aware ranking', () => {
	it('re-ranks by real runtime after hydration, not the pre-hydration neutral guess', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis([OLD_GOOD_RUNTIME_MOVIE, NEW_BAD_RUNTIME_MOVIE]);
		const result = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.tmdbId).toBe(OLD_GOOD_RUNTIME_MOVIE.id);
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

		mockExternalApis(DEFAULT_MOVIES);
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

	it('falls back to the ML pick when the LLM picks an id outside the candidate set', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		await makePremiumWithLlmRerank(householdId);

		// The model returns a well-formed pick, but for a tmdb_id that was never in the candidate
		// list -- the safety net lib/llm.ts warns callers to guard against.
		mockExternalApis(DEFAULT_MOVIES, {
			pickTmdbId: 999999,
			alternatesTmdbIds: [],
			rationale: 'A pick that was never in the candidate list.',
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
		expect(DEFAULT_MOVIES.map(m => m.id)).toContain(result.body.pick.tmdbId);
		// The bogus rationale is dropped along with the out-of-set pick -- proof it fell through to
		// the pure-ML result rather than surfacing the LLM's choice.
		expect(result.body.rationale).not.toBe(
			'A pick that was never in the candidate list.'
		);
	});

	it('honors the LLM pick order over the ML ranking and surfaces its alternates', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);
		await makePremiumWithLlmRerank(householdId);

		// MOVIE_B is older and lower-ranked than the pure-ML top pick (MOVIE_C), so choosing it
		// proves the LLM's *selection* -- not just its rationale -- overrode the ML order.
		mockExternalApis(DEFAULT_MOVIES, {
			pickTmdbId: MOVIE_B.id,
			alternatesTmdbIds: [MOVIE_A.id, MOVIE_C.id],
			rationale: 'Both of you will enjoy this one.',
		});
		const result = await postJson<{
			pick: { tmdbId: number };
			alternates: Array<{ tmdbId: number }>;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.pick.tmdbId).toBe(MOVIE_B.id);
		expect(result.body.alternates.map(a => a.tmdbId)).toEqual([
			MOVIE_A.id,
			MOVIE_C.id,
		]);
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

		// No prior `/launch` call -- committing a pick must populate `content` (title + providers) on
		// its own via `commitPick`, not rely on some other route having touched this title first.
		mockExternalApis(DEFAULT_MOVIES);
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
		expect(history.body.data[0]?.title).toBe(MOVIE_B.title);
		expect(history.body.data[0]?.providers.flatrate?.length).toBeGreaterThan(0);
	});

	it('paginates', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
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
		mockExternalApis(DEFAULT_MOVIES);
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
		mockExternalApis(DEFAULT_MOVIES);
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

describe('taste personalization from ratings', () => {
	it('nudges the taste profile from a rating and raises a subsequent pick score', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const before = await postJson<{
			pick: { tmdbId: number };
			score: number;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(before.status).toBe(200);

		mockExternalApis(DEFAULT_MOVIES);
		// mood/minutes mirror what a real commit carries (the client always sends the mood/minutes
		// it just picked with) -- needed so this rating also nudges `tone` (keyed by moodAtPick) and
		// exercises `era`/`runtime_pref` deriving from a real `content` row, not just `genres`.
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);

		const patch = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(patch.status).toBe(200);

		const profileRow = await waitForRow(() =>
			env.DB.prepare('SELECT weights FROM taste_profiles WHERE user_id = ?1')
				.bind(userId)
				.first<{ weights: string }>()
		);
		const weights = JSON.parse(profileRow.weights) as {
			genres: Record<string, number>;
			era: Record<string, number>;
			tone: Record<string, number>;
			runtime_pref: number | null;
		};
		// EMA nudge from the neutral 0.35 baseline toward 1.0 (enjoyed) at alpha 0.25:
		// 0.35 * 0.75 + 1.0 * 0.25 = 0.5125. MOVIE_A is genre 35, released 2020 (era bucket
		// "2020s"), runtime 100, rated under mood "funny" -- all four dimensions land on the same
		// EMA-from-neutral value for their one touched key.
		expect(weights.genres['35']).toBeCloseTo(0.5125, 5);
		expect(weights.era['2020s']).toBeCloseTo(0.5125, 5);
		expect(weights.tone.funny).toBeCloseTo(0.5125, 5);
		// runtime_pref has no prior estimate to EMA against -- it adopts the rated runtime outright.
		expect(weights.runtime_pref).toBe(100);
		// A genre/era/mood absent from (or not matching) the rated title stays at the neutral
		// baseline.
		expect(weights.genres['18']).toBeCloseTo(0.35, 5);
		expect(weights.era['2010s']).toBeCloseTo(0.35, 5);
		expect(weights.tone.dark).toBeCloseTo(0.35, 5);

		mockExternalApis(DEFAULT_MOVIES);
		const after = await postJson<{
			pick: { tmdbId: number };
			score: number;
		}>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(after.status).toBe(200);
		// Genre/era/tone/runtime_pref all now carry real signal instead of scoring's cold-start
		// fallbacks, so every DEFAULT_MOVIES candidate (all genre 35) scores higher than before the
		// rating -- not asserting an exact delta, since that's now a function of four blended
		// dimensions rather than one clean genre-only term.
		expect(after.body.score).toBeGreaterThan(before.body.score);
	});

	it('a learned era preference can flip the winner, overriding the default recency bias', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		// Before any rating, OLD_ERA_MOVIE and NEW_ERA_MOVIE are identical on every scored
		// dimension except release year -- the default "newer is better" recency bias decides.
		mockExternalApis([OLD_ERA_MOVIE, NEW_ERA_MOVIE]);
		const before = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(before.status).toBe(200);
		expect(before.body.pick.tmdbId).toBe(NEW_ERA_MOVIE.id);

		// Rate a *different* movie from OLD_ERA_MOVIE's era bucket -- seeds an era preference
		// without watching (and thus excluding) either actual candidate.
		mockExternalApis([RATED_OLD_ERA_MOVIE]);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${RATED_OLD_ERA_MOVIE.id}/commit`,
			{ mediaType: 'movie', mood: 'funny', minutes: 120 },
			cookies
		);
		expect(commit.status).toBe(201);
		const patch = await postJson<{ entry: { enjoyed: boolean | null } }>(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: true },
			cookies,
			{ method: 'PATCH' }
		);
		expect(patch.status).toBe(200);
		await waitForRow(() =>
			env.DB.prepare('SELECT weights FROM taste_profiles WHERE user_id = ?1')
				.bind(userId)
				.first<{ weights: string }>()
		);

		// The learned era preference is now strong enough to outweigh the recency bias.
		mockExternalApis([OLD_ERA_MOVIE, NEW_ERA_MOVIE]);
		const after = await postJson<{ pick: { tmdbId: number } }>(
			`/api/households/${householdId}/pick`,
			{ mood: 'funny', minutes: 120 },
			cookies
		);
		expect(after.status).toBe(200);
		expect(after.body.pick.tmdbId).toBe(OLD_ERA_MOVIE.id);
	});

	it('does not recompute taste when a rating is cleared back to null', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const householdId = await createHousehold(cookies);

		mockExternalApis(DEFAULT_MOVIES);
		const commit = await postJson<{ id: string }>(
			`/api/households/${householdId}/picks/${MOVIE_A.id}/commit`,
			{ mediaType: 'movie' },
			cookies
		);
		expect(commit.status).toBe(201);

		const patch = await postJson(
			`/api/households/${householdId}/history/${commit.body.id}`,
			{ enjoyed: null },
			cookies,
			{ method: 'PATCH' }
		);
		expect(patch.status).toBe(200);

		const profileRow = await env.DB.prepare(
			'SELECT user_id FROM taste_profiles WHERE user_id = ?1'
		)
			.bind(userId)
			.first();
		expect(profileRow).toBeNull();
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

		mockExternalApis(DEFAULT_MOVIES);
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

	it('POST /:id/billing/portal is owner-only and 501s while Stripe is unconfigured', async () => {
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
			`/api/households/${householdId}/billing/portal`,
			{},
			memberCookies
		);
		expect(asMember.status).toBe(403);

		// STRIPE_SECRET_KEY/STRIPE_PRICE_PREMIUM are deliberately unset throughout this test
		// suite (vitest.config.mts) -- real Stripe calls (createPortalSession) are otherwise
		// unreachable/manual-verification-only, matching creatorgrid's own lib/stripe.ts coverage.
		const asOwner = await postJson(
			`/api/households/${householdId}/billing/portal`,
			{},
			ownerCookies
		);
		expect(asOwner.status).toBe(501);
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
