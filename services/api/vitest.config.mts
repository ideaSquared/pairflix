import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

/**
 * Runs the Hono Worker's tests (src/hono/**\/*.test.ts) inside real `workerd`, via Miniflare, with
 * actual D1 bindings sourced from `wrangler.jsonc` -- not the generic Node-environment Vitest config
 * other packages use, since that can't touch bindings or call the Worker's own `fetch` handler.
 * Scoped to `src/hono` (not `src/**`, unlike creatorgrid) because `src/` outside `src/hono` is still
 * the Express app, covered by its own Jest suite (see jest.config.ts's matching
 * `testPathIgnorePatterns`) -- the two must never pick up each other's test files. See
 * src/hono/test/apply-migrations.ts for how packages/db/migrations gets applied to the ephemeral
 * test D1 before tests run.
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
            // .dev.vars.example ships with every secret blank (fine for manual `wrangler dev` --
            // routes that need one just degrade gracefully, e.g. bootstrap-admin 501s, 2FA
            // enroll/verify 501s). Tests that exercise those routes need a real value; this only
            // applies inside the test Miniflare instance.
            ADMIN_BOOTSTRAP_SECRET: 'test-bootstrap-secret',
            // Derives the AES-256-GCM key that encrypts/decrypts TOTP secrets at rest (see
            // src/hono/lib/crypto.ts). Without this, 2FA enroll/verify 501 (see
            // src/hono/routes/me.ts's fail-fast guard).
            SESSION_SECRET: 'test-session-secret',
          },
        },
      }),
    ],
    test: {
      globals: true,
      testTimeout: 10_000,
      passWithNoTests: true,
      include: ['src/hono/**/*.test.ts'],
      setupFiles: ['./src/hono/test/apply-migrations.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        exclude: ['src/hono/index.ts', 'src/hono/test/**', '**/*.test.ts'],
      },
    },
  };
});
