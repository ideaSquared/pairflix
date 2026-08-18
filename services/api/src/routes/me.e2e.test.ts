import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';
import { currentTotpCode } from '../lib/totp';
import {
	callApp,
	createLoggedInUser,
	enrollTotp,
	getCsrfToken,
	getLatestAuthToken,
	loginUser,
	postJson,
} from '../test/test-helpers';

let counter = 0;
const uniqueEmail = () => `me-e2e-${Date.now()}-${counter++}@example.com`;
const PASSWORD = 'Str0ngPass123';

const jsonResponse = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});

type MockDiscoverMovie = {
	id: number;
	title: string;
	poster_path: string | null;
	genre_ids: number[];
};

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
});

/** One entry per anchor genre id in lib/tasteOnboarding.ts's `ANCHOR_GENRE_IDS`, keyed by
 * `with_genres`, so every discover call the deck endpoint makes is deterministically mocked. Genre
 * 3501 is deliberately returned from both the comedy (35) and drama (18) genres -- comedy is
 * processed first, so it exercises the dedup-by-tmdbId path (3501 keeps comedy's [35, 18]
 * genre_ids, drama's copy is dropped). */
const MOVIES_BY_GENRE: Record<number, MockDiscoverMovie[]> = {
	35: [
		{
			id: 3501,
			title: 'Cross-genre Pick',
			poster_path: '/c1.jpg',
			genre_ids: [35, 18],
		},
		{ id: 3502, title: 'Comedy Two', poster_path: '/c2.jpg', genre_ids: [35] },
	],
	18: [
		{
			id: 3501,
			title: 'Cross-genre Pick',
			poster_path: '/c1.jpg',
			genre_ids: [35, 18],
		},
		{ id: 1802, title: 'Drama Two', poster_path: '/d2.jpg', genre_ids: [18] },
	],
	28: [
		{ id: 2801, title: 'Action One', poster_path: '/a1.jpg', genre_ids: [28] },
		{ id: 2802, title: 'Action Two', poster_path: '/a2.jpg', genre_ids: [28] },
	],
	27: [
		{ id: 2701, title: 'Horror One', poster_path: '/h1.jpg', genre_ids: [27] },
		{ id: 2702, title: 'Horror Two', poster_path: '/h2.jpg', genre_ids: [27] },
	],
	10749: [
		{
			id: 10001,
			title: 'Romance One',
			poster_path: '/r1.jpg',
			genre_ids: [10749],
		},
		{
			id: 10002,
			title: 'Romance Two',
			poster_path: '/r2.jpg',
			genre_ids: [10749],
		},
	],
	878: [
		{ id: 8701, title: 'Sci-Fi One', poster_path: '/s1.jpg', genre_ids: [878] },
		{ id: 8702, title: 'Sci-Fi Two', poster_path: '/s2.jpg', genre_ids: [878] },
	],
	99: [
		{
			id: 9901,
			title: 'Documentary One',
			poster_path: '/doc1.jpg',
			genre_ids: [99],
		},
		{
			id: 9902,
			title: 'Documentary Two',
			poster_path: '/doc2.jpg',
			genre_ids: [99],
		},
	],
	16: [
		{
			id: 1601,
			title: 'Animation One',
			poster_path: '/an1.jpg',
			genre_ids: [16],
		},
		{
			id: 1602,
			title: 'Animation Two',
			poster_path: '/an2.jpg',
			genre_ids: [16],
		},
	],
};

/** Replaces the global fetch for the rest of the current test, same intent as
 * households.e2e.test.ts's `mockExternalApis` -- unreachable/non-deterministic real TMDb calls
 * are never exercised here. */
const mockOnboardingDeckApi = (): void => {
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		const url =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: input.url;
		const { hostname, pathname, searchParams } = new URL(url);
		if (hostname === 'api.themoviedb.org' && pathname === '/3/discover/movie') {
			const genreId = Number(searchParams.get('with_genres'));
			return jsonResponse({ results: MOVIES_BY_GENRE[genreId] ?? [] });
		}
		throw new Error(`Unmocked fetch in test: ${url}`);
	}) as typeof fetch;
};

describe('2FA enroll / verify / login / disable', () => {
	it('enrolling requires a valid code, then login requires one too', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { secret } = await enrollTotp(cookies);

		const withoutCode = await loginUser(email, PASSWORD);
		expect(withoutCode.status).toBe(401);
		expect(JSON.stringify(withoutCode.body)).toContain('TOTP code required');

		const code = await currentTotpCode(secret);
		const withCode = await loginUser(email, PASSWORD, code);
		expect(withCode.status).toBe(200);
	});

	it('rejects a wrong 2FA code', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		await enrollTotp(cookies);

		const result = await loginUser(email, PASSWORD, '000000');
		expect(result.status).toBe(401);
	});

	it('consumes a backup code once, then rejects reusing it', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { backupCodes } = await enrollTotp(cookies);
		const backupCode = backupCodes[0] as string;

		const first = await loginUser(email, PASSWORD, backupCode);
		expect(first.status).toBe(200);

		const second = await loginUser(email, PASSWORD, backupCode);
		expect(second.status).toBe(401);
	});

	it('disable requires password + a valid code, then login no longer asks for one', async () => {
		const email = uniqueEmail();
		const { cookies } = await createLoggedInUser(email);
		const { secret } = await enrollTotp(cookies);

		const code = await currentTotpCode(secret);
		const disable = await postJson(
			'/api/me/2fa/disable',
			{ currentPassword: PASSWORD, code },
			cookies
		);
		expect(disable.status).toBe(204);

		const login = await loginUser(email, PASSWORD);
		expect(login.status).toBe(200);
	});
});

describe('profile updates', () => {
	it('changes username, then rejects one already taken', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());

		const newUsername = `renamed${Date.now()}`;
		const renamed = await postJson(
			'/api/me/username',
			{ username: newUsername },
			cookies,
			{ method: 'PATCH' }
		);
		expect(renamed.status).toBe(200);

		const me = await callApp<{ data: { username: string } }>('/api/auth/me', {
			cookies,
		});
		expect(me.body.data.username).toBe(newUsername);

		const { cookies: otherCookies } = await createLoggedInUser(uniqueEmail());
		const taken = await postJson(
			'/api/me/username',
			{ username: newUsername },
			otherCookies,
			{ method: 'PATCH' }
		);
		expect(taken.status).toBe(409);
	});

	it('returns a clean 409, not a 500, when two users race to claim the same username', async () => {
		const { cookies: cookiesA } = await createLoggedInUser(uniqueEmail());
		const { cookies: cookiesB } = await createLoggedInUser(uniqueEmail());
		const claim = (
			csrf: { csrfToken: string; cookies: Record<string, string> },
			username: string
		) =>
			callApp('/api/me/username', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrf.csrfToken,
				},
				body: JSON.stringify({ username }),
				cookies: csrf.cookies,
			});

		// Whether two truly-concurrent requests actually collide at the DB layer (rather than one
		// fully finishing before the other's pre-check SELECT even runs) is timing-dependent --
		// measured empirically at ~20% of attempts in this harness. 40 fresh-username attempts (same
		// two already-logged-in users throughout, to keep this well under the test timeout) pushes
		// the chance of never once hitting that overlap down close to zero, without changing what's
		// actually asserted: every attempt, raced or not, must resolve to exactly one 200 and one
		// 409, never a 500.
		for (let attempt = 0; attempt < 40; attempt++) {
			const [csrfA, csrfB] = await Promise.all([
				getCsrfToken(cookiesA),
				getCsrfToken(cookiesB),
			]);
			const targetUsername = `raceduser${Date.now()}${attempt}`;
			const [first, second] = await Promise.all([
				claim(csrfA, targetUsername),
				claim(csrfB, targetUsername),
			]);
			const statuses = [first.status, second.status].sort((a, b) => a - b);
			expect(statuses).toEqual([200, 409]);
		}
	}, 30_000);

	it('email change requires the current password and only takes effect once confirmed', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const newEmail = uniqueEmail();

		const wrongPassword = await postJson(
			'/api/me/email',
			{ email: newEmail, password: 'WrongPassword1' },
			cookies
		);
		expect(wrongPassword.status).toBe(401);

		const requested = await postJson(
			'/api/me/email',
			{ email: newEmail, password: PASSWORD },
			cookies
		);
		expect(requested.status).toBe(200);

		const meBeforeConfirm = await callApp<{ data: { email: string } }>(
			'/api/auth/me',
			{ cookies }
		);
		expect(meBeforeConfirm.body.data.email).not.toBe(newEmail);

		const token = await getLatestAuthToken(userId, 'change_email');
		const confirmed = await postJson('/api/auth/verify-email', { token }, {});
		expect(confirmed.status).toBe(200);

		const meAfterConfirm = await callApp<{ data: { email: string } }>(
			'/api/auth/me',
			{ cookies }
		);
		expect(meAfterConfirm.body.data.email).toBe(newEmail);
	});

	it('rejects confirming an email change if the address was claimed in the meantime', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());
		const contestedEmail = uniqueEmail();

		const requested = await postJson(
			'/api/me/email',
			{ email: contestedEmail, password: PASSWORD },
			cookies
		);
		expect(requested.status).toBe(200);

		const token = await getLatestAuthToken(userId, 'change_email');

		// Someone else registers (and claims) the contested address before the first user confirms.
		await createLoggedInUser(contestedEmail);

		const confirmed = await postJson('/api/auth/verify-email', { token }, {});
		expect(confirmed.status).toBe(409);
		expect(JSON.stringify(confirmed.body)).toContain('email_taken');
	});

	it('password change requires the current password and revokes other sessions', async () => {
		const email = uniqueEmail();
		const { cookies: sessionA } = await createLoggedInUser(email);
		const sessionB = (await loginUser(email, PASSWORD)).cookies;

		const wrongPassword = await postJson(
			'/api/me/password',
			{ currentPassword: 'WrongPassword1', newPassword: 'NewStr0ngPass1' },
			sessionA
		);
		expect(wrongPassword.status).toBe(401);

		const changed = await postJson(
			'/api/me/password',
			{ currentPassword: PASSWORD, newPassword: 'NewStr0ngPass1' },
			sessionA
		);
		expect(changed.status).toBe(204);

		const stillWorksA = await callApp('/api/auth/me', { cookies: sessionA });
		expect(stillWorksA.status).toBe(200);

		const revokedB = await callApp('/api/auth/me', { cookies: sessionB });
		expect(revokedB.status).toBe(401);

		const reloginOldPassword = await loginUser(email, PASSWORD);
		expect(reloginOldPassword.status).toBe(401);

		const reloginNewPassword = await loginUser(email, 'NewStr0ngPass1');
		expect(reloginNewPassword.status).toBe(200);
	});

	it('preferences update merges rather than replaces', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());

		const first = await postJson(
			'/api/me/preferences',
			{ preferences: { theme: 'light' } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(first.status).toBe(200);

		const second = await postJson<{
			data: { preferences: { theme: string; autoArchiveDays: number } };
		}>(
			'/api/me/preferences',
			{ preferences: { autoArchiveDays: 7 } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(second.status).toBe(200);
		expect(second.body.data.preferences.theme).toBe('light');
		expect(second.body.data.preferences.autoArchiveDays).toBe(7);
	});
});

describe('GET /api/me/taste-onboarding/deck', () => {
	it('rejects an unauthenticated caller', async () => {
		const result = await callApp('/api/me/taste-onboarding/deck', {});
		expect(result.status).toBe(401);
	});

	it('returns a deck of cards spanning the anchor genres, deduped by tmdbId', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		mockOnboardingDeckApi();

		const result = await callApp<{
			data: {
				cards: Array<{
					tmdbId: number;
					mediaType: string;
					title: string;
					posterPath: string | null;
					genreIds: number[];
				}>;
			};
		}>('/api/me/taste-onboarding/deck', { cookies });
		expect(result.status).toBe(200);

		const cards = result.body.data.cards;
		// 8 anchor genres x top 2 each, minus the one deliberate cross-genre duplicate.
		expect(cards).toHaveLength(15);
		expect(cards.every(c => c.mediaType === 'movie')).toBe(true);
		expect(cards.filter(c => c.tmdbId === 3501)).toHaveLength(1);
		expect(cards.find(c => c.tmdbId === 3501)?.genreIds).toEqual([35, 18]);
	});
});

describe('POST /api/me/taste-onboarding', () => {
	it('rejects an invalid verdict', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());

		const result = await postJson(
			'/api/me/taste-onboarding',
			{
				likedGenreIds: [],
				swipes: [
					{ tmdbId: 1, mediaType: 'movie', genreIds: [18], verdict: 'like' },
				],
				providers: [],
			},
			cookies
		);
		expect(result.status).toBe(400);
	});

	it('writes a dense taste_profiles row with the expected weights and updates selectedProviders', async () => {
		const { userId, cookies } = await createLoggedInUser(uniqueEmail());

		const result = await postJson(
			'/api/me/taste-onboarding',
			{
				likedGenreIds: [35],
				swipes: [
					{ tmdbId: 1, mediaType: 'movie', genreIds: [18], verdict: 'love' },
					{
						tmdbId: 2,
						mediaType: 'movie',
						genreIds: [27],
						verdict: 'not_for_me',
					},
				],
				providers: ['netflix', 'prime'],
			},
			cookies
		);
		expect(result.status).toBe(200);

		const profileRow = await env.DB.prepare(
			'SELECT weights FROM taste_profiles WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ weights: string }>();
		expect(profileRow).not.toBeNull();
		const weights = JSON.parse(profileRow!.weights) as {
			genres: Record<string, number>;
		};
		expect(Object.keys(weights.genres)).toHaveLength(18);
		// Picked genre.
		expect(weights.genres['35']).toBe(0.75);
		// Loved-swipe genre: 0.35 + 0.15.
		expect(weights.genres['18']).toBeCloseTo(0.5, 10);
		// Not-for-me-swipe genre: 0.35 - 0.2.
		expect(weights.genres['27']).toBeCloseTo(0.15, 10);
		// Untouched genre stays at the neutral baseline.
		expect(weights.genres['28']).toBe(0.35);

		const me = await callApp<{
			data: { preferences: { selectedProviders?: string[] } };
		}>('/api/auth/me', { cookies });
		expect(me.body.data.preferences.selectedProviders).toEqual([
			'netflix',
			'prime',
		]);
	});
});
