import { createDb } from '@pairflix/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { rotateAuditLogsOnSchedule } from './lib/adminAuditLogs';
import { sessionMiddleware } from './middleware/auth';
import { csrfMiddleware } from './middleware/csrf';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { healthRoutes } from './routes/health';
import { householdsRoutes } from './routes/households';
import { meRoutes } from './routes/me';
import type { AppEnv, Bindings } from './types';

const app = new Hono<AppEnv>();

app.use(
	'*',
	cors({
		origin: (origin, c) => {
			const allowed = String(c.env.ALLOWED_ORIGINS ?? '')
				.split(',')
				.map(value => value.trim())
				.filter(Boolean);
			// Fail closed: an empty allowlist must grant no origin, not reflect whatever Origin the
			// caller sent (that combined with credentials: true is a reflected-origin CORS
			// anti-pattern). Returning undefined tells hono/cors to omit
			// Access-Control-Allow-Origin entirely. Local dev is unaffected -- the Vite proxy makes
			// client requests same-origin, so the browser never consults this header for them (see
			// .dev.vars.example's ALLOWED_ORIGINS comment).
			if (allowed.length === 0) return undefined;
			return allowed.includes(origin) ? origin : (allowed[0] ?? '');
		},
		credentials: true,
	})
);
// Registered after cors() so CORS preflight (OPTIONS) responses -- which cors() returns
// directly without calling next() -- skip these headers entirely; real requests still pass
// through both. crossOriginResourcePolicy is relaxed from Hono's 'same-origin' default because
// this API is deliberately called cross-origin (with credentials) by apps/client and apps/admin.
// No Content-Security-Policy is set: this Worker only ever returns JSON, so there's no HTML
// surface for a CSP to protect.
app.use('*', secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }));
app.use('*', sessionMiddleware);
app.use('/api/*', csrfMiddleware);

app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/me', meRoutes);
app.route('/api/households', householdsRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/billing', billingRoutes);

app.notFound(c => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => {
	console.error(error);
	return c.json({ error: 'Internal server error' }, 500);
});

export default {
	fetch: app.fetch,
	async scheduled(_controller, env, ctx) {
		ctx.waitUntil(
			rotateAuditLogsOnSchedule(createDb(env.DB)).catch(err => {
				console.error('[cron] failed to rotate audit logs', err);
			})
		);
	},
} satisfies ExportedHandler<Bindings>;
