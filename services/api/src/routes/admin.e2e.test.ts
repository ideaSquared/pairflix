import { env } from 'cloudflare:workers';
import { content, contentReports, createDb, sessions } from '@pairflix/db';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import { pruneExpiredData } from '../lib/retention';
import {
	callApp,
	createLoggedInAdmin,
	createLoggedInUser,
	loginUser,
	postJson,
	promoteToAdmin,
	registerAndVerify,
	uniqueIp,
} from '../test/test-helpers';

let counter = 0;
const uniqueEmail = () => `admin-e2e-${Date.now()}-${counter++}@example.com`;
const uniqueTmdbId = () => 800_000 + counter++;

const RESET_LINK_TOKEN_PATTERN = /reset-password\?token=([0-9a-f]{64})/;

const captureResetToken = async (
	trigger: () => Promise<{ status: number }>
): Promise<string> => {
	const realFetch = globalThis.fetch;
	const resendBodies: string[] = [];
	const originalKey = env.RESEND_API_KEY;
	const originalFrom = env.EMAIL_FROM;
	env.RESEND_API_KEY = 'test-resend-key';
	env.EMAIL_FROM = 'noreply@pairflix.example';
	globalThis.fetch = vi.fn(
		async (input: RequestInfo | URL, init?: RequestInit) => {
			if (String(input) !== 'https://api.resend.com/emails')
				return realFetch(input, init);
			resendBodies.push(String(init?.body));
			return new Response('{}', { status: 200 });
		}
	);
	try {
		const result = await trigger();
		if (result.status !== 200) {
			throw new Error(`reset trigger failed: ${result.status}`);
		}
		const token = resendBodies
			.map(body => RESET_LINK_TOKEN_PATTERN.exec(body)?.[1])
			.find(match => match !== undefined);
		if (!token) throw new Error('No reset-password token found in sent email');
		return token;
	} finally {
		globalThis.fetch = realFetch;
		env.RESEND_API_KEY = originalKey;
		env.EMAIL_FROM = originalFrom;
	}
};

const userStatus = async (userId: string): Promise<string | undefined> =>
	(
		await env.DB.prepare('SELECT status FROM users WHERE user_id = ?1')
			.bind(userId)
			.first<{ status: string }>()
	)?.status;

const seedContent = async (overrides: {
	status?: 'active' | 'pending' | 'flagged' | 'removed';
	reportedCount?: number;
}): Promise<string> => {
	const db = createDb(env.DB);
	const id = `content_e2e_${Date.now()}_${counter++}`;
	const now = new Date();
	await db.insert(content).values({
		id,
		title: 'Some Movie',
		type: 'movie',
		tmdbId: uniqueTmdbId(),
		status: overrides.status ?? 'pending',
		reportedCount: overrides.reportedCount ?? 0,
		providers: {},
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const seedReport = async (
	contentId: string,
	userId: string,
	status: 'pending' | 'dismissed' | 'resolved' = 'pending'
): Promise<string> => {
	const db = createDb(env.DB);
	const id = `report_e2e_${Date.now()}_${counter++}`;
	const now = new Date();
	await db.insert(contentReports).values({
		id,
		contentId,
		userId,
		reason: 'Inappropriate',
		status,
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

describe('admin routes -- authorization', () => {
	it('rejects an unauthenticated caller', async () => {
		const result = await callApp('/api/admin/users', {});
		expect(result.status).toBe(401);
	});

	it('rejects a non-admin caller', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const result = await callApp('/api/admin/users', { cookies });
		expect(result.status).toBe(403);
	});

	it('rejects an admin who has not enrolled two-factor auth', async () => {
		const email = uniqueEmail();
		const { userId } = await registerAndVerify(email, 'Str0ngPass123');
		await promoteToAdmin(userId);
		// Logs in with just a password -- an admin can authenticate without TOTP, but the admin
		// surface stays closed until 2FA is enrolled.
		const login = await loginUser(email, 'Str0ngPass123');
		expect(login.status).toBe(200);

		const result = await callApp<{ error: string }>('/api/admin/users', {
			cookies: login.cookies,
		});
		expect(result.status).toBe(403);
		expect(result.body.error).toContain(
			'Two-factor authentication is required'
		);
	});
});

describe('admin routes -- user management', () => {
	it('creates a user, then rejects a duplicate email', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const email = uniqueEmail();
		const created = await postJson<{ id: string; email: string }>(
			'/api/admin/users',
			{ username: `au${Date.now()}`, email, password: 'Str0ngPass123' },
			cookies
		);
		expect(created.status).toBe(201);
		expect(created.body.email).toBe(email);

		const duplicate = await postJson(
			'/api/admin/users',
			{ username: `au2${Date.now()}`, email, password: 'Str0ngPass123' },
			cookies
		);
		expect(duplicate.status).toBe(409);
	});

	it('lists, fetches, updates, and deletes a user', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId } = await createLoggedInUser(uniqueEmail());

		const list = await callApp<{ data: Array<{ id: string }> }>(
			'/api/admin/users?limit=100',
			{ cookies }
		);
		expect(list.status).toBe(200);
		expect(list.body.data.some(u => u.id === userId)).toBe(true);

		const get = await callApp(`/api/admin/users/${userId}`, { cookies });
		expect(get.status).toBe(200);

		const updated = await postJson<{ username: string }>(
			`/api/admin/users/${userId}`,
			{ username: `renamed${Date.now()}` },
			cookies,
			{ method: 'PATCH' }
		);
		expect(updated.status).toBe(200);

		const deleted = await postJson(`/api/admin/users/${userId}`, {}, cookies, {
			method: 'DELETE',
		});
		expect(deleted.status).toBe(204);

		const getAfterDelete = await callApp(`/api/admin/users/${userId}`, {
			cookies,
		});
		expect(getAfterDelete.status).toBe(404);
	});

	it('returns 409, not 500, updating a user to an email already taken by someone else', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const takenEmail = uniqueEmail();
		await createLoggedInUser(takenEmail);
		const { userId } = await createLoggedInUser(uniqueEmail());

		const result = await postJson(
			`/api/admin/users/${userId}`,
			{ email: takenEmail },
			cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(409);
	});

	it('returns 409, not 500, updating a user to a username already taken by someone else', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const { username: takenUsername } = await registerAndVerify(
			uniqueEmail(),
			'Str0ngPass123'
		);
		const { userId } = await createLoggedInUser(uniqueEmail());

		const result = await postJson(
			`/api/admin/users/${userId}`,
			{ username: takenUsername },
			cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(409);
	});

	// 40 iterations x 2 concurrent requests is meaningfully more work than a typical test in this
	// file -- an explicit timeout gives it headroom on a loaded CI runner instead of trimming the
	// iteration count (and the collision-probability margin it protects, see below).
	it('returns a clean 409, not a 500, when two admin updates race for the same email', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		// registerAndVerify (not createLoggedInUser) -- these two never need their own session, an
		// admin is doing the patching, and skipping their login avoids a second PBKDF2 verify per
		// user. Created once, outside the loop: what's being raced is which of the two claims each
		// iteration's fresh target email, not their own identity, so there's no need to pay for 80
		// fresh users (which, combined with createLoggedInUser's extra login step, was slow enough
		// to cascade into unrelated timeouts elsewhere in this file when this test first shipped).
		const [{ userId: userA }, { userId: userB }] = await Promise.all([
			registerAndVerify(uniqueEmail(), 'Str0ngPass123'),
			registerAndVerify(uniqueEmail(), 'Str0ngPass123'),
		]);

		// Neither PATCH's pre-check can see the other's write coming -- both target *different*
		// existing users, racing to claim the same new email, so the only thing that can catch this
		// is the DB-level unique-constraint fallback. Timing-dependent whether a given attempt
		// actually collides at the DB layer rather than one fully finishing first; 40 fresh-target
		// attempts (same margin as the register-race test in auth.e2e.test.ts) pushes the chance of
		// never once hitting that overlap down to roughly 1.5%, without changing what's asserted:
		// every attempt, raced or not, must resolve to exactly one 200 and one 409, never a 500.
		for (let attempt = 0; attempt < 40; attempt++) {
			const targetEmail = uniqueEmail();
			const [first, second] = await Promise.all([
				postJson(`/api/admin/users/${userA}`, { email: targetEmail }, cookies, {
					method: 'PATCH',
				}),
				postJson(`/api/admin/users/${userB}`, { email: targetEmail }, cookies, {
					method: 'PATCH',
				}),
			]);
			const statuses = [first.status, second.status].sort((a, b) => a - b);
			expect(statuses).toEqual([200, 409]);
		}
	}, 30_000);

	it('404s updating an unknown user', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const result = await postJson(
			'/api/admin/users/user_does_not_exist',
			{ username: 'whoever' },
			cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(404);
	});

	it('suspending a user terminates their sessions immediately', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const { userId, cookies: targetCookies } =
			await createLoggedInUser(targetEmail);

		const statusChange = await postJson(
			`/api/admin/users/${userId}/status`,
			{ status: 'suspended', reason: 'testing' },
			adminCookies,
			{ method: 'PATCH' }
		);
		expect(statusChange.status).toBe(200);

		const meAfter = await callApp('/api/me', { cookies: targetCookies });
		expect(meAfter.status).toBe(401);
	});

	it('returns the plaintext password when sendEmail is false', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId } = await createLoggedInUser(uniqueEmail());

		const result = await postJson<{ newPassword: string }>(
			`/api/admin/users/${userId}/reset-password`,
			{ sendEmail: false },
			cookies
		);
		expect(result.status).toBe(200);
		expect(result.body.newPassword.length).toBeGreaterThanOrEqual(8);
	});

	it('force-password-reset blocks login with the old password until reset', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const password = 'Str0ngPass123';
		const { userId } = await createLoggedInUser(targetEmail, password);

		const forced = await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);
		expect(forced.status).toBe(200);

		const relogin = await loginUser(targetEmail, password);
		expect(relogin.status).toBe(403);
	});

	it('force-password-reset emails a link that completes the reset and reactivates the account', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId } = await createLoggedInUser(uniqueEmail());

		const token = await captureResetToken(() =>
			postJson(
				`/api/admin/users/${userId}/force-password-reset`,
				{},
				adminCookies
			)
		);
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);
		expect(await userStatus(userId)).toBe('active');
	});

	it('force-password-reset revokes the target sessions immediately', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId, cookies: targetCookies } =
			await createLoggedInUser(uniqueEmail());

		const forced = await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);
		expect(forced.status).toBe(200);

		const after = await callApp('/api/households', { cookies: targetCookies });
		expect(after.status).toBe(401);
	});

	it('reset-password revokes the target sessions immediately', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId, cookies: targetCookies } =
			await createLoggedInUser(uniqueEmail());

		const reset = await postJson(
			`/api/admin/users/${userId}/reset-password`,
			{ sendEmail: false },
			adminCookies
		);
		expect(reset.status).toBe(200);

		const after = await callApp('/api/households', { cookies: targetCookies });
		expect(after.status).toBe(401);
	});

	it('a second force-password-reset invalidates the first emailed link', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId } = await createLoggedInUser(uniqueEmail());
		const force = () =>
			postJson(
				`/api/admin/users/${userId}/force-password-reset`,
				{},
				adminCookies
			);

		const firstToken = await captureResetToken(force);
		const secondToken = await captureResetToken(force);

		const stale = await postJson('/api/auth/reset-password', {
			token: firstToken,
			password: 'NewStr0ngPass456',
		});
		expect(stale.status).toBe(400);
		const fresh = await postJson('/api/auth/reset-password', {
			token: secondToken,
			password: 'NewStr0ngPass456',
		});
		expect(fresh.status).toBe(200);
	});

	it('forgot-password after a force-reset still ends with an active account', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const { userId } = await createLoggedInUser(targetEmail);
		const forced = await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);
		expect(forced.status).toBe(200);

		const token = await captureResetToken(() =>
			postJson(
				'/api/auth/forgot-password',
				{ email: targetEmail },
				{},
				{ ip: uniqueIp() }
			)
		);
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);
		expect(await userStatus(userId)).toBe('active');
	});

	it('a force-reset whose link expired and was pruned still ends active after forgot-password and reset', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const { userId } = await createLoggedInUser(targetEmail, 'Str0ngPass123');
		const forced = await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);
		expect(forced.status).toBe(200);

		await env.DB.prepare(
			'UPDATE auth_tokens SET expires_at = ?1 WHERE user_id = ?2'
		)
			.bind(Date.now() - 1000, userId)
			.run();
		await pruneExpiredData(createDb(env.DB));
		const remaining = await env.DB.prepare(
			'SELECT COUNT(*) AS n FROM auth_tokens WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ n: number }>();
		expect(remaining?.n).toBe(0);

		const token = await captureResetToken(() =>
			postJson(
				'/api/auth/forgot-password',
				{ email: targetEmail },
				{},
				{ ip: uniqueIp() }
			)
		);
		const reset = await postJson('/api/auth/reset-password', {
			token,
			password: 'NewStr0ngPass456',
		});
		expect(reset.status).toBe(200);
		expect(await userStatus(userId)).toBe('active');
		expect((await loginUser(targetEmail, 'NewStr0ngPass456')).status).toBe(200);
	});

	it('a link issued before a force-reset is rejected and changes nothing', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const { userId } = await createLoggedInUser(targetEmail, 'Str0ngPass123');
		const staleToken = await captureResetToken(() =>
			postJson(
				'/api/auth/forgot-password',
				{ email: targetEmail },
				{},
				{ ip: uniqueIp() }
			)
		);
		await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);

		const stale = await postJson(
			'/api/auth/reset-password',
			{ token: staleToken, password: 'NewStr0ngPass456' },
			{},
			{ ip: uniqueIp() }
		);
		expect(stale.status).toBe(400);
		expect(stale.cookies.session).toBeUndefined();
		expect(await userStatus(userId)).toBe('pending');
		const flag = await env.DB.prepare(
			'SELECT password_reset_required AS f FROM users WHERE user_id = ?1'
		)
			.bind(userId)
			.first<{ f: number }>();
		expect(flag?.f).toBe(1);
	});

	it('force-reset on a banned account sets the flag and keeps it banned', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId } = await createLoggedInUser(uniqueEmail());
		await env.DB.prepare(
			"UPDATE users SET status = 'banned' WHERE user_id = ?1"
		)
			.bind(userId)
			.run();
		const forced = await postJson(
			`/api/admin/users/${userId}/force-password-reset`,
			{},
			adminCookies
		);
		expect(forced.status).toBe(200);
		expect(await userStatus(userId)).toBe('banned');
	});

	it('audits whether a completed reset cleared a forced flag', async () => {
		const completedFlag = async (userId: string): Promise<unknown> => {
			const rows = await env.DB.prepare(
				"SELECT context FROM audit_logs WHERE message = 'Password reset completed' ORDER BY created_at DESC"
			).all<{ context: string }>();
			return rows.results
				.map(r => JSON.parse(r.context) as Record<string, unknown>)
				.find(ctx => ctx.userId === userId)?.forcedByAdmin;
		};
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());

		const forcedEmail = uniqueEmail();
		const { userId: forcedId } = await createLoggedInUser(forcedEmail);
		const forcedToken = await captureResetToken(() =>
			postJson(
				`/api/admin/users/${forcedId}/force-password-reset`,
				{},
				adminCookies
			)
		);
		await postJson('/api/auth/reset-password', {
			token: forcedToken,
			password: 'NewStr0ngPass456',
		});
		expect(await completedFlag(forcedId)).toBe(true);

		const normalEmail = uniqueEmail();
		const { userId: normalId } = await createLoggedInUser(normalEmail);
		const normalToken = await captureResetToken(() =>
			postJson(
				'/api/auth/forgot-password',
				{ email: normalEmail },
				{},
				{ ip: uniqueIp() }
			)
		);
		await postJson('/api/auth/reset-password', {
			token: normalToken,
			password: 'NewStr0ngPass456',
		});
		expect(await completedFlag(normalId)).toBe(false);
	});

	it('locked-accounts reflects the real login lockout threshold', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const targetEmail = uniqueEmail();
		const { userId } = await registerAndVerify(targetEmail, 'Str0ngPass123');

		for (let i = 0; i < 5; i++) {
			await loginUser(targetEmail, 'WrongPassword1');
		}

		const locked = await callApp<{ data: Array<{ id: string }> }>(
			'/api/admin/locked-accounts?limit=100',
			{ cookies }
		);
		expect(locked.status).toBe(200);
		expect(locked.body.data.some(u => u.id === userId)).toBe(true);

		const unlocked = await postJson(
			`/api/admin/users/${userId}/unlock`,
			{},
			cookies
		);
		expect(unlocked.status).toBe(200);

		const lockedAfter = await callApp<{ data: Array<{ id: string }> }>(
			'/api/admin/locked-accounts?limit=100',
			{ cookies }
		);
		expect(lockedAfter.body.data.some(u => u.id === userId)).toBe(false);
	});

	it('lists and terminates a user session, which actually invalidates it', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId, cookies: targetCookies } =
			await createLoggedInUser(uniqueEmail());

		const sessions = await callApp<{ sessions: Array<{ id: string }> }>(
			`/api/admin/users/${userId}/sessions`,
			{ cookies: adminCookies }
		);
		expect(sessions.status).toBe(200);
		expect(sessions.body.sessions.length).toBeGreaterThan(0);
		const sessionId = sessions.body.sessions[0]?.id;

		const terminated = await postJson(
			`/api/admin/users/${userId}/sessions/${sessionId}`,
			{},
			adminCookies,
			{ method: 'DELETE' }
		);
		expect(terminated.status).toBe(204);

		const meAfter = await callApp('/api/me', { cookies: targetCookies });
		expect(meAfter.status).toBe(401);
	});

	it('never exposes the session cookie value, and stores only a hash of it', async () => {
		const { cookies: adminCookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId, cookies: targetCookies } =
			await createLoggedInUser(uniqueEmail());
		const cookieValue = targetCookies.session ?? '';
		expect(cookieValue).not.toBe('');

		const listed = await callApp<{ sessions: Array<{ id: string }> }>(
			`/api/admin/users/${userId}/sessions`,
			{ cookies: adminCookies }
		);
		const ids = listed.body.sessions.map(s => s.id);
		expect(ids.length).toBeGreaterThan(0);
		expect(ids).not.toContain(cookieValue);

		const stored = await createDb(env.DB)
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.userId, userId));
		expect(stored.map(s => s.id)).not.toContain(cookieValue);

		const replays = await Promise.all(
			ids.map(id => callApp('/api/auth/me', { cookies: { session: id } }))
		);
		expect(replays.map(r => r.status)).toEqual(ids.map(() => 401));

		const stillValid = await callApp('/api/auth/me', {
			cookies: targetCookies,
		});
		expect(stillValid.status).toBe(200);
	});

	it('exports users as CSV', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const result = await callApp('/api/admin/users/export', { cookies });
		expect(result.status).toBe(200);
		expect(result.response.headers.get('content-type')).toContain('text/csv');
	});
});

describe('admin routes -- audit logs', () => {
	it('lists audit logs and rejects an invalid level', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());

		const list = await callApp<{ data: unknown[] }>('/api/admin/audit-logs', {
			cookies,
		});
		expect(list.status).toBe(200);
		expect(Array.isArray(list.body.data)).toBe(true);

		const invalid = await callApp('/api/admin/audit-logs/not-a-level', {
			cookies,
		});
		expect(invalid.status).toBe(400);

		const byLevel = await callApp<{ data: unknown[] }>(
			'/api/admin/audit-logs/info',
			{ cookies }
		);
		expect(byLevel.status).toBe(200);
	});

	it('returns log sources and stats', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());

		const sources = await callApp<{ sources: string[] }>(
			'/api/admin/audit-logs/sources',
			{ cookies }
		);
		expect(sources.status).toBe(200);
		expect(Array.isArray(sources.body.sources)).toBe(true);

		const stats = await callApp<{ total: number; byLevel: object }>(
			'/api/admin/audit-logs/stats',
			{ cookies }
		);
		expect(stats.status).toBe(200);
		expect(typeof stats.body.total).toBe('number');
		expect(stats.body.byLevel).toHaveProperty('info');
	});
});

describe('admin routes -- settings', () => {
	it('patches and reads back nested settings without clobbering unrelated keys', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());

		const first = await postJson(
			'/api/admin/settings',
			{ general: { siteName: 'Pairflix Test' } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(first.status).toBe(200);

		const second = await postJson<{
			general: { siteName: string };
			recommendation: { llm_rerank: boolean };
		}>(
			'/api/admin/settings',
			{ recommendation: { llm_rerank: true } },
			cookies,
			{ method: 'PATCH' }
		);
		expect(second.status).toBe(200);
		expect(second.body.general.siteName).toBe('Pairflix Test');
		expect(second.body.recommendation.llm_rerank).toBe(true);
	});
});

describe('admin routes -- content moderation', () => {
	it('flags, approves, and removes content', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const contentId = await seedContent({});

		const flagged = await postJson<{ status: string }>(
			`/api/admin/content/${contentId}/flag`,
			{},
			cookies,
			{ method: 'PATCH' }
		);
		expect(flagged.status).toBe(200);
		expect(flagged.body.status).toBe('flagged');

		const approved = await postJson<{ status: string }>(
			`/api/admin/content/${contentId}/approve`,
			{},
			cookies,
			{ method: 'PATCH' }
		);
		expect(approved.body.status).toBe('active');

		const removed = await postJson<{
			status: string;
			removalReason: string | null;
		}>(
			`/api/admin/content/${contentId}/remove`,
			{ reason: 'not appropriate' },
			cookies,
			{ method: 'PATCH' }
		);
		expect(removed.body.status).toBe('removed');
		expect(removed.body.removalReason).toBe('not appropriate');

		const list = await callApp<{ data: Array<{ id: string }> }>(
			'/api/admin/content?status=removed',
			{ cookies }
		);
		expect(list.body.data.some(row => row.id === contentId)).toBe(true);
	});

	it('dismissing a report decrements reportedCount once, not on repeat dismissal', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const { userId: reporterId } = await createLoggedInUser(uniqueEmail());
		const contentId = await seedContent({ reportedCount: 2 });
		const reportId = await seedReport(contentId, reporterId, 'pending');

		const reports = await callApp<{
			reports: Array<{ id: string; reporterUsername: string }>;
		}>(`/api/admin/content/${contentId}/reports`, { cookies });
		expect(reports.status).toBe(200);
		expect(reports.body.reports.some(r => r.id === reportId)).toBe(true);

		const firstDismiss = await postJson(
			`/api/admin/reports/${reportId}/dismiss`,
			{},
			cookies,
			{ method: 'PATCH' }
		);
		expect(firstDismiss.status).toBe(200);

		const afterFirst = await callApp<{
			data: Array<{ id: string; reportedCount: number }>;
		}>('/api/admin/content?search=Some Movie', { cookies });
		expect(
			afterFirst.body.data.find(row => row.id === contentId)?.reportedCount
		).toBe(1);

		const secondDismiss = await postJson(
			`/api/admin/reports/${reportId}/dismiss`,
			{},
			cookies,
			{ method: 'PATCH' }
		);
		expect(secondDismiss.status).toBe(200);

		const afterSecond = await callApp<{
			data: Array<{ id: string; reportedCount: number }>;
		}>('/api/admin/content?search=Some Movie', { cookies });
		expect(
			afterSecond.body.data.find(row => row.id === contentId)?.reportedCount
		).toBe(1);
	});

	it('404s dismissing an unknown report', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const result = await postJson(
			'/api/admin/reports/report_does_not_exist/dismiss',
			{},
			cookies,
			{ method: 'PATCH' }
		);
		expect(result.status).toBe(404);
	});
});

describe('admin routes -- dashboard', () => {
	it('returns dashboard stats', async () => {
		const { cookies } = await createLoggedInAdmin(uniqueEmail());
		const result = await callApp<{
			totalUsers: number;
			totalHouseholds: number;
			premiumHouseholds: number;
		}>('/api/admin/dashboard-stats', { cookies });
		expect(result.status).toBe(200);
		expect(typeof result.body.totalUsers).toBe('number');
		expect(typeof result.body.totalHouseholds).toBe('number');
		expect(typeof result.body.premiumHouseholds).toBe('number');
	});
});
