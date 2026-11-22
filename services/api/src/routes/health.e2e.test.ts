import { describe, expect, it } from 'vitest';
import { callApp } from '../test/test-helpers';

describe('GET /health', () => {
	it('reports ok without touching the database', async () => {
		const result = await callApp<{ status: string }>('/health');

		expect(result.status).toBe(200);
		expect(result.body).toEqual({ status: 'ok' });
	});
});

describe('GET /health/ready', () => {
	it('reports ok when D1 is reachable', async () => {
		const result = await callApp<{ status: string }>('/health/ready');

		expect(result.status).toBe(200);
		expect(result.body).toEqual({ status: 'ok' });
	});
});
