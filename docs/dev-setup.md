# Development setup

> **Cloudflare/pnpm workflow (ADR 0001).** This is how the repo builds and runs today — `docs/roadmap.md`
> tracks how it got here.

## Prerequisites

- **Node 22** (`>=22.22 <23`; pinned via `.nvmrc` / `.tool-versions`, added in the P1 restructure)
- **pnpm 10** (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Wrangler** — installed per-workspace as a dev dependency; run via `pnpm exec wrangler` or the
  package scripts. No global install needed.
- A **TMDb API key**, and (for the premium re-rank) an **Anthropic API key**
- A **Cloudflare account** only for `--remote` / deploy; **local dev needs none** (Miniflare emulates
  D1 and R2)
- **No Docker** — retired from the app path (ADR 0001, P5).

## First run

```bash
git clone <repository-url> && cd pairflix
pnpm install                     # installs every workspace
cp services/api/.dev.vars.example services/api/.dev.vars   # local Worker vars (see below)
pnpm --filter @pairflix/api db:migrate:local                # create + migrate the local D1
pnpm dev                         # turbo: Worker + both Pages apps in parallel
```

- API (Worker): `http://localhost:8787`
- Client app: `http://localhost:5173`
- Admin app: `http://localhost:5174`

## Layout

```
pairflix/
├── apps/client/        # user SPA (Vite + React), Pages, wrangler.jsonc
├── apps/admin/         # admin SPA (Vite + React), Pages, wrangler.jsonc
├── services/api/       # Hono Worker, wrangler.jsonc  (routes, middleware, lib)
├── packages/db/        # Drizzle schema + client + SQL migrations
├── packages/lib.components/   # shared UI
├── packages/lib.*/     # shared types / api client / utils / validation
└── docs/
```

Workspaces are declared in `pnpm-workspace.yaml` (`apps/*`, `services/*`, `packages/*`). Turborepo
(`turbo.json`) orchestrates `dev` / `build` / `test` / `lint` with caching. Internal deps use
`workspace:*`.

## Common commands (from the repo root)

```bash
pnpm dev                         # everything, in parallel (turbo)
pnpm --filter @pairflix/api dev  # just the Worker (wrangler dev)
pnpm --filter @pairflix/client dev

pnpm build                       # turbo build across workspaces
pnpm test                        # turbo test (vitest; api uses @cloudflare/vitest-pool-workers)
pnpm lint                        # eslint across workspaces
pnpm format                      # prettier
pnpm -r type-check               # tsc --noEmit per workspace
```

## Local database (D1 via Miniflare)

```bash
pnpm --filter @pairflix/db db:generate         # drizzle-kit generate after editing schema.ts
pnpm --filter @pairflix/api db:migrate:local   # wrangler d1 migrations apply pairflix-db --local

# inspect the local DB
pnpm exec wrangler d1 execute pairflix-db --local --command "select * from households"
```

The local D1 lives under `.wrangler/` and is disposable — delete it and re-migrate to reset.

### Dev seed data

```bash
pnpm --filter @pairflix/api db:seed:local             # flat DevLogin fixture users (see below)
pnpm --filter @pairflix/api db:seed:households:local   # paired-up households, free + premium
```

Both are `--local`-only and idempotent (safe to rerun). `db:seed:local` seeds the account-status
fixtures `apps/client/src/components/dev/DevLogin.tsx`'s dev-only quick-login panel expects
(active/banned/suspended/admin), with no households attached. `db:seed:households:local` seeds five
households (two free-tier, three premium/active — i.e. unlimited daily picks, no region lock) so a
household-scoped flow (pick/commit, quota, provider filters) can be exercised without first
hand-creating a household through the UI/API; it prints each household's name, tier, and owner
login email on completion. All seeded users share the password `password123`.

## Environment & secrets

- **Local Worker vars** go in `services/api/.dev.vars` (gitignored): `TMDB_API_KEY`,
  `ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS`, etc. Missing optional keys degrade gracefully (the LLM
  re-rank and provider fetch log-and-skip rather than fail), matching creatorgrid's
  "unconfigured is a valid state" pattern.
- **Production secrets** are set with `wrangler secret put <NAME>` per Worker — never committed.
- **Frontend env** uses `VITE_*` in each app's `.env` (e.g. `VITE_API_URL`).

## Deploy

```bash
pnpm --filter @pairflix/api db:migrate:remote  # apply migrations to prod D1 first
pnpm --filter @pairflix/api deploy             # wrangler deploy (Worker)
pnpm --filter @pairflix/client deploy          # wrangler pages deploy
pnpm --filter @pairflix/admin deploy           # wrangler pages deploy
```

**Not done yet:** no D1 database has been provisioned in a Cloudflare account (`wrangler d1 create
pairflix-db`, then replace the placeholder `database_id` in `services/api/wrangler.jsonc`), and
there's no CI step running any of the above — deploy today is manual, and provisioning needs real
Cloudflare account access this repo's automated tooling doesn't have. Worker and Pages also roll
back differently; there's no self-contained rollback runbook here yet — see creatorgrid's
`docs/deploying.md` for the reference procedure in the meantime.

## Troubleshooting

- **`wrangler dev` can't find the DB** — run `db:migrate:local` first; the binding name is `DB`, the
  database name is `pairflix-db` (see `services/api/wrangler.jsonc`).
- **A `packages/*` change isn't picked up** — Turborepo caches builds; `pnpm build` the changed
  package, or run `pnpm dev` which watches. Shared-package edits affect both apps — type-check both.
- **Auth/CSRF failures in local dev** — the client must fetch `GET /api/auth/csrf-token` and echo the
  `csrfToken` cookie back as `x-csrf-token` on writes; check `ALLOWED_ORIGINS` includes your dev
  origin.
