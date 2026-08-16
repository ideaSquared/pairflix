import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { sessionMiddleware } from './middleware/auth';
import { csrfMiddleware } from './middleware/csrf';
import { authRoutes } from './routes/auth';
import { healthRoutes } from './routes/health';
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
			if (allowed.length === 0) return origin;
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

app.notFound(c => c.json({ error: 'Not found' }, 404));
app.onError((error, c) => {
	console.error(error);
	return c.json({ error: 'Internal server error' }, 500);
});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Bindings>;
