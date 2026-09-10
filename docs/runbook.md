# Runbook

Operational procedures for Pairflix: the first production deploy, the full secrets/vars list,
rollback, and D1 backup. This is the doc to read before running
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) for the first time.

> **Status.** Nothing in this document has been exercised against a real Cloudflare account yet --
> there is no production deploy today (see `CLAUDE.md`, `docs/roadmap.md`). This is the procedure to
> follow once that account exists, cross-checked against the code (`services/api/src`'s `env.*`
> reads, `wrangler.jsonc`), not a description of something already running.

## Read this first: cross-site cookies

**This is the single thing most likely to make a first deploy look broken.**

Pairflix's session and CSRF cookies are `SameSite=Lax` (`services/api/src/lib/session.ts`,
`src/routes/auth.ts`). A `SameSite=Lax` cookie is not sent on a cross-site `fetch()` request. If
`apps/client` ends up deployed at `pairflix-client.pages.dev` and `services/api` at
`pairflix-api-production.<account>.workers.dev`, those are different registrable domains as far as
the browser is concerned -- every authenticated request comes back `401`, every write comes back
`403`, session cookies never persist, and it looks exactly like a broken auth deploy rather than a
domain-topology problem.

There are two ways to fix it, and the fix is infrastructure, not code:

1. **Shared registrable domain.** Put the client on `app.pairflix.example` and the API on
   `api.pairflix.example` (both under `pairflix.example`) using Cloudflare custom domains/routes.
   Cookies scoped to `.pairflix.example` (or issued from `api.` and read by a same-site `app.`) are
   same-site. Requires `services/api/wrangler.jsonc`'s per-environment `routes`/custom domain
   configuration (not present yet -- currently no `routes` block, see that file's comments) and a
   real zone.
2. **Pages proxy.** Configure `apps/client`/`apps/admin` so `/api/*` requests are proxied through the
   Pages domain itself to the Worker (a Pages Function, or a platform-level route), keeping every
   request same-origin from the browser's point of view -- the same trick the local Vite dev server
   proxy already does for `localhost`.

**Do not** "fix" this by changing the cookie to `SameSite=None` -- that requires `Secure` and weakens
the CSRF posture the double-submit pattern relies on. Pick one of the two options above before
declaring a first deploy done, and if login/write requests 401/403 immediately after a deploy, check
this before anything else.

## Prerequisites (must exist before `deploy.yml` can do anything real)

- A Cloudflare account, with Workers, Pages, and D1 enabled.
- Two D1 databases: `wrangler d1 create pairflix-db-staging` and
  `wrangler d1 create pairflix-db-production`. Replace the placeholder `database_id`s in
  `services/api/wrangler.jsonc`'s `env.staging` / `env.production` blocks with the real ids each
  command prints.
- Real `ALLOWED_ORIGINS` values in those same blocks, once `apps/client`/`apps/admin` have real
  domains (comma-separated, matches `services/api/src/middleware/auth.ts`'s `cors()`).
- The domain/proxy decision above (cross-site cookies), configured before or alongside the first
  deploy.
- Two Cloudflare Pages projects, `pairflix-client` and `pairflix-admin` (matching the `--project-name`
  values `deploy.yml` uses; `wrangler pages deploy` can create a project on first push, but creating
  it explicitly first is less surprising).
- A Cloudflare API token (Workers Scripts:Edit, D1:Edit, Pages:Edit) and the account id, stored as the
  `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets on the `staging` and `production` GitHub
  Environments (Settings -> Environments in the repo) so `deploy.yml`'s `environment:` input resolves
  each target to its own credentials.
- Every Worker secret in the table below, set per environment with
  `wrangler secret put <NAME> --env staging` / `--env production`.

## Environment variables and secrets

Cross-checked against every `env.*` read in `services/api/src` and every `import.meta.env.VITE_*`
read in `apps/*/src` (grep both if this list ever looks stale -- don't trust it blindly, including
this copy of it).

### Worker (`services/api`) -- set via `wrangler.jsonc` `vars` or `wrangler secret put`

| Name                     | Where set                                                                         | Notes                                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DB`                     | `wrangler.jsonc` `d1_databases` binding                                           | Not a secret -- the D1 database itself                                                                                                                                                 |
| `ENVIRONMENT`            | `wrangler.jsonc` `vars` (per env)                                                 | `"staging"` / `"production"` -- flips the session cookie to `Secure` and enables real email sending                                                                                    |
| `ALLOWED_ORIGINS`        | `wrangler.jsonc` `vars` (per env)                                                 | Comma-separated origins allowed to call the API with credentials. Placeholder until real domains exist                                                                                 |
| `BILLING_MOCK_ENABLED`   | `wrangler.jsonc` `vars` (per env)                                                 | Must be the literal string `"true"` to enable the mock billing flow. Keep `"false"` in production until real Stripe is live                                                            |
| `SESSION_SECRET`         | `wrangler secret put SESSION_SECRET --env <env>`                                  | Derives the AES-256-GCM key that encrypts TOTP secrets at rest. Generate a random value per environment, never reuse the dev placeholder                                               |
| `ADMIN_BOOTSTRAP_SECRET` | `wrangler secret put ADMIN_BOOTSTRAP_SECRET --env <env>`                          | Claims the admin role once, via `POST /api/auth/bootstrap-admin`; self-disables permanently once any admin exists. Generate a random value                                             |
| `APP_CLIENT_URL`         | `wrangler secret put APP_CLIENT_URL --env <env>` (or `vars`, not sensitive)       | Base URL of the deployed `apps/client` -- verification/reset email links point here. Becoming a **required** binding (no more localhost fallback) -- must be set for every real deploy |
| `TMDB_API_KEY`           | `wrangler secret put TMDB_API_KEY --env <env>`                                    | Required for `POST /api/households/:id/pick` to return anything. Get one at https://www.themoviedb.org/settings/api                                                                    |
| `RESEND_API_KEY`         | `wrangler secret put RESEND_API_KEY --env <env>`                                  | Optional -- unset logs verification/reset links to the console instead of sending real email                                                                                           |
| `EMAIL_FROM`             | `wrangler secret put EMAIL_FROM --env <env>` (or `vars`, not sensitive)           | Required alongside `RESEND_API_KEY` for real email to send                                                                                                                             |
| `ANTHROPIC_API_KEY`      | `wrangler secret put ANTHROPIC_API_KEY --env <env>`                               | Optional -- unset keeps the premium LLM re-rank falling back to the pure-ML pick. Also gated behind the `recommendation.llm_rerank` feature flag and premium entitlements              |
| `STRIPE_SECRET_KEY`      | `wrangler secret put STRIPE_SECRET_KEY --env <env>`                               | Optional -- unset keeps checkout on the existing mock flow                                                                                                                             |
| `STRIPE_WEBHOOK_SECRET`  | `wrangler secret put STRIPE_WEBHOOK_SECRET --env <env>`                           | Optional -- unset 501s `POST /api/billing/webhook` rather than trusting an unverifiable payload                                                                                        |
| `STRIPE_PRICE_PREMIUM`   | `wrangler secret put STRIPE_PRICE_PREMIUM --env <env>` (or `vars`, not sensitive) | Required alongside `STRIPE_SECRET_KEY` for real Stripe checkout to be considered configured                                                                                            |

`TEST_MIGRATIONS` also appears in `services/api/src/test/env.d.ts` -- that one is test-only, supplied
by `vitest.config.mts`'s Miniflare bindings, and is never set for a real deploy.

### Frontend (`apps/client`, `apps/admin`) -- set via each app's `.env` / Pages build environment

| Name                        | App(s)        | Notes                                                                                                                                        |
| --------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`              | client, admin | Leave unset when the app and API are same-origin (the supported topology, see above). Only set to point at a different, same-site Worker     |
| `VITE_BILLING_MOCK_ENABLED` | client        | Must be the literal string `"true"` to show the mock billing UI. Independent of the Worker's own `BILLING_MOCK_ENABLED` -- set both together |
| `VITE_AFFILIATE_PARAMS`     | client        | Optional JSON object of affiliate tracking params appended to provider links. Invalid/missing JSON means no params are added                 |

### GitHub Actions secrets (for `deploy.yml`)

| Name                    | Scope                                       | Notes                                                                   |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | GitHub Environments `staging`, `production` | Scoped Cloudflare API token (Workers Scripts:Edit, D1:Edit, Pages:Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Environments `staging`, `production` | The Cloudflare account id the token belongs to                          |

## First production deploy, step by step

1. Provision the Cloudflare account and the prerequisites above (D1 databases, domains/proxy, Pages
   projects, GitHub secrets).
2. Replace every placeholder in `services/api/wrangler.jsonc`'s `env.staging` / `env.production`
   blocks (`database_id`, `ALLOWED_ORIGINS`) with real values, and set every Worker secret in the
   table above for both environments.
3. Run `wrangler d1 migrations apply pairflix-db-staging --env staging --remote` (and the production
   equivalent) once, by hand, to confirm the schema applies cleanly before automating it.
4. Trigger `.github/workflows/deploy.yml` via `workflow_dispatch` with `environment: staging`. It
   runs the same gates as `ci.yml`, applies D1 migrations remotely, then deploys the Worker and both
   Pages apps.
5. Smoke-test staging: register a household, run a pick, confirm the session cookie persists across a
   page reload (this is exactly where the cross-site cookie problem above would show up first).
6. Repeat with `environment: production` once staging looks right.

There is currently no automated smoke test step in `deploy.yml` -- step 5 is manual.

## Rollback

- **Worker (`services/api`).** Every `wrangler deploy` creates a new Worker Version. Roll back with
  `wrangler versions list --env <env>` to find the previous version id, then
  `wrangler rollback --env <env> --version-id <id>` (see `wrangler rollback --help`). This does not
  touch D1 -- see the migrations note below.
- **Pages (`apps/client`, `apps/admin`).** Cloudflare Pages keeps every deployment; roll back from the
  dashboard (Pages project -> Deployments -> "..." on a prior deployment -> Rollback to this
  deployment) or `wrangler pages deployment list` / `wrangler pages deployment rollback` for the
  equivalent from the CLI.
- **D1 migrations are forward-only.** There is no down-migration mechanism
  (`packages/db/migrations/*.sql`, applied in order, never modified once shipped -- see `CLAUDE.md`).
  If a migration ships a bad schema change, fix it with a new forward migration, not a rollback of the
  migration file. If a migration corrupted data (not just schema), restore from D1 Time Travel (below)
  rather than trying to hand-write a reverse migration.

## D1 backup: Time Travel

D1 has built-in point-in-time recovery ("Time Travel") with no manual backup step required -- every
write is retained for a rolling window (30 days by default on paid plans; shorter on the free tier --
confirm the current retention window for the account this deploys to, since it affects how far back a
restore can reach).

- Inspect available restore points: `wrangler d1 time-travel info pairflix-db-production --env production`
- Restore to a point in time or a specific bookmark:
  `wrangler d1 time-travel restore pairflix-db-production --env production --timestamp <ISO8601>`
  (or `--bookmark <bookmark-id>` from the `info` output)

Time Travel restores the whole database to that point -- there is no per-table or per-row restore.
Treat it as the last resort for data corruption, not a substitute for testing migrations against
staging first.
