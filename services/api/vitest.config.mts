import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

/**
 * Runs the Worker's tests (src/**\/*.test.ts) inside real `workerd`, via Miniflare, with actual D1
 * bindings sourced from `wrangler.jsonc` -- not the generic Node-environment Vitest config other
 * packages use, since that can't touch bindings or call the Worker's own `fetch` handler. See
 * src/test/apply-migrations.ts for how packages/db/migrations gets applied to the ephemeral test D1
 * before tests run.
 */
export default defineConfig(async () => {
  // `import.meta.dirname` would work too (this is Node 22+/ESM), but its availability depends on
  // how Vite's config loader executes this file -- `import.meta.url` is the more portable ESM
  // equivalent of `__dirname` and always resolves.
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationsPath = path.join(configDir, '../../packages/db/migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            // wrangler.jsonc's own `vars.ENVIRONMENT` is 'production' (a placeholder -- there's no
            // per-environment wrangler config split yet, see that file's own comment). Overridden
            // here so the four `ENVIRONMENT !== 'production'` / `=== 'development'` checks in
            // routes/auth.ts, lib/session.ts, lib/email.ts, and lib/billing.ts behave like the
            // non-production deployment a test run actually is.
            ENVIRONMENT: 'development',
            // .dev.vars.example ships with every secret blank (fine for manual `wrangler dev` --
            // routes that need one just degrade gracefully, e.g. bootstrap-admin 501s, 2FA
            // enroll/verify 501s). Tests that exercise those routes need a real value; this only
            // applies inside the test Miniflare instance.
            ADMIN_BOOTSTRAP_SECRET: 'test-bootstrap-secret',
            // Derives the AES-256-GCM key that encrypts/decrypts TOTP secrets at rest (see
            // src/lib/crypto.ts). Without this, 2FA enroll/verify 501 (see
            // src/routes/me.ts's fail-fast guard).
            SESSION_SECRET: 'test-session-secret',
            // households.e2e.test.ts stubs globalThis.fetch, so these never reach a real API --
            // ANTHROPIC_API_KEY only needs to be non-empty so lib/llm.ts's fail-fast guard doesn't
            // short-circuit before the stub is called.
            TMDB_API_KEY: 'test-tmdb-key',
            ANTHROPIC_API_KEY: 'test-anthropic-key',
            // Lets billing.e2e.test.ts sign real webhook payloads and exercise
            // routes/billing.ts's actual event-handling logic. STRIPE_SECRET_KEY/
            // STRIPE_PRICE_PREMIUM are deliberately left unset (like RESEND_API_KEY) so
            // isStripeConfigured stays false and every existing checkout/portal test keeps
            // exercising the mock-fallback path unchanged.
            STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
          },
        },
      }),
    ],
    test: {
      globals: true,
      // Every e2e test logs in at least one real user (PBKDF2, deliberately expensive -- see
      // lib/crypto.ts), several log in two or three. That's fine on a dev machine but CI's shared,
      // constrained CPU running every workspace's suite at once has occasionally pushed even a
      // single-login test past a 10s budget with no logic actually hung -- see the per-test
      // override on the heaviest race test below for the same reasoning at a larger scale.
      testTimeout: 20_000,
      passWithNoTests: true,
      include: ['src/**/*.test.ts'],
      setupFiles: ['./src/test/apply-migrations.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        exclude: ['src/index.ts', 'src/test/**', '**/*.test.ts'],
      },
    },
  };
});
