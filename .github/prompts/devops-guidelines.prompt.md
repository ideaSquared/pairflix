---
mode: 'agent'
description: 'DevOps guidelines for Cloudflare Workers/Pages, CI/CD, and environments'
applyTo: '**/wrangler.jsonc,.github/workflows/*.yml'
---

# DevOps Guidelines

No Docker, no containers, no VMs in the app path -- the stack is `apps/*` + `services/*` on
Cloudflare Pages/Workers (ADR 0001, `docs/architecture.md`). This is pre-launch alpha: no production
data, no exercised production deploy yet.

## Cloudflare Workers/Pages

- One Worker (`services/api`, Hono) + two Pages apps (`apps/client`, `apps/admin`), each with its own
  `wrangler.jsonc`.
- `services/api/wrangler.jsonc` defines named environments (`env.staging`, `env.production`) with
  their own `vars` and `d1_databases` -- named environments don't inherit `vars`/`d1_databases` from
  the top-level config, so keep both in sync when either changes.
- D1 migrations are forward-only: `wrangler d1 migrations apply <db-name> --env <env> --remote`. No
  down-migrations -- a bad migration is fixed by a new forward migration, not a rollback.
- Cloudflare Pages has no config-file "environments"; production vs. preview is decided by which
  branch a deployment is attached to (`wrangler pages deploy --branch <name>`).

## CI/CD

- `ci.yml`: format check, lint, type-check, test, build -- runs on every push to `master` and every
  PR. Required status check name is load-bearing (see the comment in that file); don't rename the
  job.
- `deploy.yml`: `workflow_dispatch` only, not on push -- there is no Cloudflare account, D1 database,
  or domain provisioned yet, so a push-triggered deploy would fail on every merge. Runs the same
  gates as `ci.yml`, then applies D1 migrations remotely, then deploys the Worker and both Pages
  apps. See its top-of-file comment and `docs/runbook.md` for what has to exist before it can
  actually succeed.
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` are GitHub secrets, scoped per GitHub Environment
  (`staging` / `production`) so each target gets its own credentials. Worker secrets
  (`SESSION_SECRET`, `TMDB_API_KEY`, ...) are set with `wrangler secret put <NAME> --env <env>`, never
  committed -- see `docs/runbook.md`'s secrets table for the full list.
- Keep `permissions:` least-privilege on every workflow (`contents: read` unless a job genuinely
  needs more).

## The cross-site cookie trap

Session and CSRF cookies are `SameSite=Lax`. If apps/client and services/api end up on unrelated
domains (e.g. a `*.pages.dev` client calling a `*.workers.dev` API), the browser never sends the
cookie cross-site -- every authenticated request 401s, every write 403s, and it looks like the app is
broken rather than a deploy topology problem. The API and client need a shared registrable domain, or
Pages needs to proxy `/api` to the Worker. See `docs/runbook.md`'s "Cross-site cookies" section before
debugging anything else on a fresh deploy.

## Environment variable drift

Every Worker env var/secret read via `env.X` (`services/api/src`) must exist in
`services/api/.dev.vars.example` and in `wrangler.jsonc`'s `vars`; every `VITE_*` var read via
`import.meta.env` in `apps/*/src` must exist in that app's `.env.example`. CI runs
`wrangler types --check` to catch `wrangler.jsonc` drifting from its generated bindings -- keep
`worker-configuration.d.ts` current (`pnpm --filter @pairflix/api cf-typegen`) when you change vars.
