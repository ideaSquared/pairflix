import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { callApp } from '../test/test-helpers';

describe('GET /health', () => {
	it('reports ok without touching the database', async () => {
		const result = await callApp<{ status: string }>('/health');

		expect(result.status).toBe(200);
		expect(result.body).toEqual({ status: 'ok' });
	});

	it('stays up with a session cookie when D1 is unavailable', async () => {
		const original = env.DB;
		env.DB = {
			prepare: () => {
				throw new Error('D1 unavailable');
			},
		} as unknown as D1Database; // test double: only the failing prepare() is exercised
		try {
			const result = await callApp<{ status: string }>('/health', {
				cookies: { session: 'any-session-token' },
			});

			expect(result.status).toBe(200);
			expect(result.body).toEqual({ status: 'ok' });
		} finally {
			env.DB = original;
		}
	});
});

describe('GET /health/ready', () => {
	it('reports ok when D1 is reachable', async () => {
		const result = await callApp<{ status: string }>('/health/ready');

		expect(result.status).toBe(200);
		expect(result.body).toEqual({ status: 'ok' });
	});
});
