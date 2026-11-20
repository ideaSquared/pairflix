import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	callApp,
	createLoggedInUser,
	postJson,
	type Cookies,
} from '../test/test-helpers';

/** Tokens the GitHub stub below knows. The member token is in the `ideaSquared/pairflix` team; the
 * outsider token is a real GitHub user who is not. Any other token is rejected like GitHub rejects
 * a bad one. */
const MEMBER_TOKEN = 'ops-member-token';
const OUTSIDER_TOKEN = 'ops-outsider-token';
const GITHUB_TEST_LOGIN = 'octo-staff';

let counter = 0;
const uniqueEmail = () => `opsneedle-${Date.now()}-${counter++}@example.com`;

type OpsBody = {
	command?: string;
	mode?: string;
	result?: Record<string, unknown>;
	summary?: string;
	error?: { code: string; message: string };
};

/**
 * Stands in for api.github.com: `/user`, and the `pairflix` team membership the ops endpoint
 * checks with the caller's own token. Both known tokens resolve to a GitHub user, so the 403 test
 * proves only the team grants access. Anything off api.github.com fails loudly.
 */
const githubApiStub = async (
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> => {
	const url = new URL(
		typeof input === 'string'
			? input
			: input instanceof URL
				? input.toString()
				: input.url
	);
	if (url.hostname !== 'api.github.com') {
		return new Response(`Unexpected outbound request in tests: ${url}`, {
			status: 502,
		});
	}
	const token = new Headers(init?.headers)
		.get('authorization')
		?.replace(/^Bearer /, '');
	if (token !== MEMBER_TOKEN && token !== OUTSIDER_TOKEN) {
		return Response.json({ message: 'Bad credentials' }, { status: 401 });
	}
	if (url.pathname === '/user') {
		return Response.json({ login: GITHUB_TEST_LOGIN });
	}
	if (
		url.pathname ===
		`/orgs/ideaSquared/teams/pairflix/memberships/${GITHUB_TEST_LOGIN}`
	) {
		return token === MEMBER_TOKEN
			? Response.json({ state: 'active', role: 'member' })
			: Response.json({ message: 'Not Found' }, { status: 404 });
	}
	return Response.json({ message: 'Not Found' }, { status: 404 });
};

const REAL_FETCH = globalThis.fetch;
beforeEach(() => {
	globalThis.fetch = githubApiStub;
});
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
});

const invokeOps = (
	command: string,
	args: Record<string, unknown>,
	token: string = MEMBER_TOKEN
) =>
	callApp<OpsBody>('/api/ops/invoke', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ command, args, mode: 'run' }),
	});

const HOUSEHOLD_NAME = 'Opsneedle Household';

const seedHousehold = async (): Promise<{
	email: string;
	userId: string;
	householdId: string;
	cookies: Cookies;
}> => {
	const email = uniqueEmail();
	const { userId, cookies } = await createLoggedInUser(email);
	const created = await postJson<{ household: { id: string } }>(
		'/api/households',
		{ name: HOUSEHOLD_NAME },
		cookies
	);
	if (created.status !== 201) {
		throw new Error(`seedHousehold failed: ${created.status}`);
	}
	return {
		email,
		userId,
		householdId: created.body.household.id,
		cookies: created.cookies,
	};
};

const insertPickEvent = async (
	householdId: string,
	kind: string,
	providerSlug: string | null = null
): Promise<void> => {
	await env.DB.prepare(
		`INSERT INTO pick_events (id, household_id, tmdb_id, media_type, kind, provider_slug, occurred_at)
		 VALUES (?1, ?2, 550, 'movie', ?3, ?4, ?5)`
	)
		.bind(crypto.randomUUID(), householdId, kind, providerSlug, Date.now())
		.run();
};

const expectNoPersonalData = (
	body: unknown,
	leaks: readonly string[]
): void => {
	const text = JSON.stringify(body);
	for (const leaked of leaks) expect(text).not.toContain(leaked);
};

describe('ops auth', () => {
	it('requires a bearer token for the catalog', async () => {
		const result = await callApp<OpsBody>('/api/ops/catalog');
		expect(result.status).toBe(401);
		expect(result.body.error?.code).toBe('unauthenticated');
	});

	it('rejects a token GitHub does not recognise', async () => {
		const result = await callApp<OpsBody>('/api/ops/catalog', {
			headers: { authorization: 'Bearer nope' },
		});
		expect(result.status).toBe(401);
		expect(result.body.error?.code).toBe('unauthenticated');
	});

	it('403s a GitHub user outside the pairflix team, for the catalog and for invoke', async () => {
		const catalog = await callApp<OpsBody>('/api/ops/catalog', {
			headers: { authorization: `Bearer ${OUTSIDER_TOKEN}` },
		});
		const invoke = await invokeOps('stats.overview', {}, OUTSIDER_TOKEN);
		expect(catalog.status).toBe(403);
		expect(invoke.status).toBe(403);
		expect(invoke.body.error?.code).toBe('forbidden');
	});

	it('does not accept a session cookie in place of a GitHub token', async () => {
		const { cookies } = await createLoggedInUser(uniqueEmail());
		const result = await callApp<OpsBody>('/api/ops/catalog', { cookies });
		expect(result.status).toBe(401);
	});

	it('lists the v1 commands for a team member', async () => {
		const result = await callApp<{
			version: number;
			product: string;
			environment: string;
			commands: { id: string; kind: string; dryRun: boolean }[];
		}>('/api/ops/catalog', {
			headers: { authorization: `Bearer ${MEMBER_TOKEN}` },
		});
		expect(result.status).toBe(200);
		expect(result.body.version).toBe(1);
		expect(result.body.product).toBe('pairflix');
		expect(result.body.environment).toBe('development');
		expect(result.body.commands.map(command => command.id)).toEqual([
			'stats.overview',
			'household.show',
			'household.pick-stats',
		]);
		expect(
			result.body.commands.every(
				command => command.kind === 'read' && !command.dryRun
			)
		).toBe(true);
	});

	it('404s an unknown command', async () => {
		const result = await invokeOps('household.delete', {});
		expect(result.status).toBe(404);
		expect(result.body.error?.code).toBe('not_found');
	});
});

describe('CSRF', () => {
	const csrfCookies = { csrfToken: 'cookie-token' };

	it('is not applied to the ops path, which never reads cookies', async () => {
		const result = await callApp<OpsBody>('/api/ops/invoke', {
			method: 'POST',
			cookies: csrfCookies,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${MEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				command: 'stats.overview',
				args: {},
				mode: 'run',
			}),
		});
		expect(result.status).toBe(200);
	});

	it.each([
		['a households route', '/api/households'],
		['an auth route', '/api/auth/logout'],
		['a look-alike prefix', '/api/opsx/invoke'],
		['a sibling under the ops name', '/api/ops-admin/invoke'],
	])('is still enforced on %s', async (_label, path) => {
		const result = await callApp<{ error?: string }>(path, {
			method: 'POST',
			cookies: csrfCookies,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${MEMBER_TOKEN}`,
			},
			body: '{}',
		});
		expect(result.status).toBe(403);
		expect(result.body.error).toBe('CSRF token missing or invalid');
	});
});

describe('stats.overview', () => {
	it('returns platform-wide counts only', async () => {
		const { email } = await seedHousehold();

		const result = await invokeOps('stats.overview', {});

		expect(result.status).toBe(200);
		expect(result.body.mode).toBe('run');
		const stats = result.body.result ?? {};
		expect(Object.keys(stats).sort()).toEqual([
			'activeUsers',
			'premiumHouseholds',
			'recentErrorCount',
			'totalHouseholds',
			'totalUsers',
		]);
		expect(stats.totalUsers).toBeGreaterThanOrEqual(1);
		expect(stats.totalHouseholds).toBeGreaterThanOrEqual(1);
		expectNoPersonalData(result.body, [email, HOUSEHOLD_NAME]);
	});
});

describe('household.show', () => {
	it('shows a household by id with ids, counts and entitlements, never names or emails', async () => {
		const { email, userId, householdId } = await seedHousehold();

		const result = await invokeOps('household.show', { householdId });

		expect(result.status).toBe(200);
		expect(result.body.result).toMatchObject({
			householdId,
			memberCount: 1,
			ownerUserIds: [userId],
			subscription: null,
			entitlements: {
				tier: 'free',
				picksUsedToday: 0,
				regionLock: 'GB',
			},
		});
		expectNoPersonalData(result.body, [email, HOUSEHOLD_NAME]);
	});

	it('404s an unknown household', async () => {
		const result = await invokeOps('household.show', {
			householdId: 'no-such-household',
		});
		expect(result.status).toBe(404);
		expect(result.body.error?.code).toBe('not_found');
	});

	it('400s a missing household id', async () => {
		const result = await invokeOps('household.show', {});
		expect(result.status).toBe(400);
		expect(result.body.error?.code).toBe('invalid_argument');
	});
});

describe('household.pick-stats', () => {
	it('summarises a household’s pick events in the window', async () => {
		const { householdId } = await seedHousehold();
		await insertPickEvent(householdId, 'proposed');
		await insertPickEvent(householdId, 'accepted');
		await insertPickEvent(householdId, 'swapped');
		await insertPickEvent(householdId, 'provider_launched', 'netflix');

		const result = await invokeOps('household.pick-stats', {
			householdId,
			windowDays: 7,
		});

		expect(result.status).toBe(200);
		expect(result.body.result).toMatchObject({
			householdId,
			windowDays: 7,
			totals: {
				proposed: 1,
				accepted: 1,
				swapped: 1,
				dismissed: 0,
				provider_launched: 1,
			},
			firstPickAcceptanceRate: 0.5,
			providerClicksBySlug: { netflix: 1 },
		});
	});

	it('defaults to a 30-day window and rejects one out of range', async () => {
		const { householdId } = await seedHousehold();
		const fallback = await invokeOps('household.pick-stats', { householdId });
		expect(fallback.body.result).toMatchObject({ windowDays: 30 });

		const bad = await invokeOps('household.pick-stats', {
			householdId,
			windowDays: 0,
		});
		expect(bad.status).toBe(400);
		expect(bad.body.error?.code).toBe('invalid_argument');
	});

	it('404s an unknown household', async () => {
		const result = await invokeOps('household.pick-stats', {
			householdId: 'no-such-household',
		});
		expect(result.status).toBe(404);
	});
});
