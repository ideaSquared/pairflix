import type { D1Database } from '@cloudflare/workers-types';
import type { Entitlements } from './lib/entitlements';

/** Worker bindings (see wrangler.jsonc) plus environment vars / secrets. Grows as later P3 domains
 * (providers/history, billing/admin) land -- only what the auth and households/pick domains need
 * so far. */
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
	/** TMDb API key -- titles, discover, and watch-provider lookups (lib/tmdb.ts). */
	TMDB_API_KEY?: string;
	/** Premium LLM re-rank (lib/llm.ts) -- absent means `rerankCandidates` always throws
	 * `LLMUnavailable`, which `lib/recommendation.ts` catches to fall back to the pure-ML pick,
	 * same "unconfigured is a valid state" degrade as the current Express `llm.service.ts`. */
	ANTHROPIC_API_KEY?: string;
	/** Gates `POST /:id/billing/mock-activate` (lib/billing.ts) -- unset means enabled whenever
	 * `ENVIRONMENT !== 'production'`, same "unconfigured is a valid state" default as the current
	 * Express `isBillingMockEnabled()`. Set to the literal string `'false'` to hard-disable. */
	BILLING_MOCK_ENABLED?: string;
	/** Real Stripe billing (lib/stripe.ts) -- `isStripeConfigured` requires both this and
	 * STRIPE_PRICE_PREMIUM; absent means `POST /:id/billing/checkout` falls back to the existing
	 * mock checkout, same "unconfigured is a valid state" pattern as the rest of this Bindings
	 * type. */
	STRIPE_SECRET_KEY?: string;
	/** Verifies `POST /api/billing/webhook`'s `stripe-signature` header -- absent means the
	 * webhook route 501s rather than trusting an unverifiable payload. */
	STRIPE_WEBHOOK_SECRET?: string;
	/** Stripe Price id for the one paid tier -- pairflix is free/premium only, unlike creatorgrid's
	 * per-plan price ids. */
	STRIPE_PRICE_PREMIUM?: string;
};

/** Request-scoped values set by middleware. */
export type Variables = {
	userId: string | null;
	/** Set by `middleware/entitlements.ts`'s `enforceRegionLock` so `enforcePickQuota` (and the
	 * pick route handler, for the region-lock value itself) don't each recompute it. */
	entitlements?: Entitlements;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };
