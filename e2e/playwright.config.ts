import { defineConfig } from '@playwright/test';

/**
 * Browser end-to-end tests for the client SPA (apps/client). These are distinct from the API's
 * `*.e2e.test.ts` integration tests, which run in-process under @cloudflare/vitest-pool-workers --
 * these drive a real Chromium against the built UI.
 *
 * The suite runs the client on its own and stubs every `/api/**` call at the network layer (see
 * tests/support/api-mock.ts), so it needs no running Worker or D1 and stays deterministic. That
 * keeps it green as a required check on `master` while the real Cloudflare infrastructure is still
 * unprovisioned (see docs/dev-setup.md).
 */

const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

// In CI, Playwright downloads its own matching browser (see .github/workflows/e2e.yml). In the
// pre-provisioned dev container a Chromium is already on disk, so point at it via this env var to
// skip the download -- unset elsewhere, letting Playwright use its bundled build.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'pnpm --filter @pairflix/client dev',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
