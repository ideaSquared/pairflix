import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { log } from '../lib/log';

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get('/', async c => {
	try {
		await c.env.DB.prepare('SELECT 1').first();
		return c.json({ status: 'ok' });
	} catch (error) {
		log.error('d1 health check failed', {}, error);
		return c.json({ status: 'degraded' }, 503);
	}
});
