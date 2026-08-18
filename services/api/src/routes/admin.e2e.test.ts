import { env } from 'cloudflare:workers';
import { content, contentReports, createDb } from '@pairflix/db';
import { describe, expect, it } from 'vitest';
import {
	callApp,
	createLoggedInAdmin,
	createLoggedInUser,
	loginUser,
	postJson,
	registerAndVerify,
} from '../test/test-helpers';

let counter = 0;
const uniqueEmail = () => `admin-e2e-${Date.now()}-${counter++}@example.com`;
const uniqueTmdbId = () => 800_000 + counter++;

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
