# @pairflix/e2e

Playwright browser end-to-end tests for the client SPA (`apps/client`).

These are **browser** e2e tests -- a real Chromium driving the built UI -- and are separate from the
API's `*.e2e.test.ts` integration tests, which run in-process under
`@cloudflare/vitest-pool-workers`.

## What they cover

Smoke coverage of the highest-value user-visible flows: the landing page and its anonymous demo
pick, sign-in/registration forms and their client-side validation, and auth-gated routing. Every
`/api/**` call is stubbed at the network layer (`tests/support/api-mock.ts`), so the suite needs no
running Worker or D1 and stays deterministic -- which is what lets it be a required check on
`master` while real Cloudflare infrastructure is still unprovisioned (see `docs/dev-setup.md`).

## Running locally

From the repo root:

```bash
pnpm --filter @pairflix/e2e exec playwright install chromium   # one-time browser download
pnpm --filter @pairflix/e2e test:e2e                           # run the suite
pnpm --filter @pairflix/e2e test:e2e:ui                        # watch/debug in the Playwright UI
```

Playwright starts the client dev server itself (see `webServer` in `playwright.config.ts`) and tears
it down afterward.

If a Chromium is already present on disk (e.g. a pre-provisioned dev container), point at it to skip
the download:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm --filter @pairflix/e2e test:e2e
```

## CI

`.github/workflows/e2e.yml`:

- **`master` (push / merge): mandatory.** The suite always runs.
- **Pull requests: opt-in.** It runs only when the PR carries the **`e2e`** label, so routine PRs
  aren't slowed by a browser run -- add the label to exercise it before merge.

Because the PR run is label-gated it is deliberately **not** configured as a required status check on
PRs (a required check has to report on every PR); the mandatory gate lives on the `master` branch.
