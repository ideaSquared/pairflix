import type { D1Database } from '@cloudflare/workers-types';

/** Worker bindings (see wrangler.jsonc) plus environment vars / secrets. Grows as later P3 domains
 * (households/pick, providers/history, billing/admin) land -- only what the auth domain needs so
 * far. */
export type Bindings = {
	DB: D1Database;
	ENVIRONMENT: string;
	ALLOWED_ORIGINS: string;
	/** Derives the AES-256-GCM key that encrypts TOTP secrets at rest (lib/crypto.ts). */
	SESSION_SECRET?: string;
	/** Claims the admin role for the calling session -- see `authRoutes.post('/bootstrap-admin')`. */
	ADMIN_BOOTSTRAP_SECRET?: string;
	RESEND_API_KEY?: string;
	EMAIL_FROM?: string;
	/** Base URL of apps/client -- verification/reset links point here. */
	APP_CLIENT_URL?: string;
};

/** Request-scoped values set by middleware. */
export type Variables = {
	userId: string | null;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };
