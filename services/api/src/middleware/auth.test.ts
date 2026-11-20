import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import type { AppEnv } from '../types';
import { sessionMiddlewareExceptOps } from './auth';

// A D1 binding whose every query fails, standing in for a D1 outage.
const failingDb = {
	prepare: () => {
		throw new Error('D1 unavailable');
	},
};

const app = new Hono<AppEnv>();
app.use('*', sessionMiddlewareExceptOps);
app.get('*', c => c.json({ userId: c.get('userId') ?? null }));
app.onError((_err, c) => c.json({ error: 'failed' }, 500));

const request = (path: string) =>
	app.request(path, { headers: { cookie: 'session=some-token' } }, {
		DB: failingDb,
	} as unknown as AppEnv['Bindings']); // a partial env: only DB is read here

describe('session resolution', () => {
	it('never looks up a session for the ops endpoint, which authenticates with a GitHub token', async () => {
		const res = await request('/api/ops/catalog');
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ userId: null });
	});

	it('still looks up the session cookie everywhere else', async () => {
		expect((await request('/api/households')).status).toBe(500);
		expect((await request('/api/opsx/catalog')).status).toBe(500);
	});
});
