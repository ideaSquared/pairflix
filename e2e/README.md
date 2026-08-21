# @pairflix/e2e

Playwright browser end-to-end tests for the client SPA (`apps/client`).

These are **browser** e2e tests -- a real Chromium driving the built UI -- and are separate from the
API's `*.e2e.test.ts` integration tests, which run in-process under
`@cloudflare/vitest-pool-workers`.

## What they cover

One spec file per user journey (the filename names the journey; a file that bundles related
sub-flows groups them with `test.describe`). Coverage map:

| Journey             | Spec                       | Scenarios                                                                                                                               |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Landing page        | `landing.spec.ts`          | hero + demo-pick form renders; links through to login                                                                                   |
| Anonymous demo pick | `demo-pick.spec.ts`        | pick returns a title; API error is surfaced                                                                                             |
| Sign in             | `login.spec.ts`            | form renders; protected route redirects to login; login -> tonight; bad-credentials error                                               |
| Register            | `register.spec.ts`         | password-mismatch validation; success -> check-your-email                                                                               |
| Account email flows | `auth-email.spec.ts`       | email verification (verify / expired-resend / missing token); password reset (missing-token / mismatch / valid submit); forgot password |
| Pick tonight        | `tonight-pick.spec.ts`     | pick for a mood + time; swap (exclude + swapped event); commit; provider launch                                                         |
| Household funnel    | `household-funnel.spec.ts` | create -> onboarding; generate invite link; accept invite; invalid/expired invite                                                       |
| Taste onboarding    | `onboarding.spec.ts`       | genres -> swipe -> providers -> submit; skip to an internal next; reject an external next                                               |
| Watch history       | `history.spec.ts`          | list renders; thumbs rating (PATCH); empty state; no-household state                                                                    |
| Upgrade / billing   | `upgrade.spec.ts`          | quota-refused error; upgrade banner -> checkout; mock-activate -> tonight                                                               |
| Profile settings    | `profile.spec.ts`          | username / password / theme updates; password-policy rejection                                                                          |

Every `/api/**` call is stubbed at the network layer, so the suite needs no running Worker or D1 and
stays deterministic -- which is what lets it be a required check on `master` while real Cloudflare
infrastructure is still unprovisioned (see `docs/dev-setup.md`). Two stub helpers live under
`tests/support/`:

- `api-mock.ts` -- the stateless stub for the anonymous specs (`landing`, `demo-pick`).
- `authed-api-mock.ts` -- a small stateful fake `/api` with path-pattern routing. `seedAuthedSession()`
  seeds a logged-in session (`GET /api/auth/me` returns a user, so no real cookie is needed) and
  `seedLoggedOut()` seeds the signed-out state; each spec then registers or overrides the endpoints
  its journey touches.

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
