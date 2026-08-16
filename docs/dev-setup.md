# Development setup

> **Target state (ADR 0001).** This is the Cloudflare/pnpm workflow Pairflix is moving to. Until the
> restructure phase lands, the repo still builds with npm + Docker — see git history. `docs/roadmap.md`
> tracks the cutover.

## Prerequisites

- **Node 22** (`>=22.22 <23`; see `.nvmrc` / `.tool-versions`)
- **pnpm 10** (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Wrangler** — installed per-workspace as a dev dependency; run via `pnpm exec wrangler` or the
  package scripts. No global install needed.
- A **TMDb API key**, and (for the premium re-rank) an **Anthropic API key**
- A **Cloudflare account** only for `--remote` / deploy; **local dev needs none** (Miniflare emulates
  D1 and R2)
- **No Docker.** The old `docker-compose` stack is retired from the app path.

## First run

```bash
git clone <repository-url> && cd pairflix
pnpm install                     # installs every workspace
cp services/api/.dev.vars.example services/api/.dev.vars   # local Worker vars (see below)
pnpm --filter @pairflix/db db:migrate:local                # create + migrate the local D1
pnpm --filter @pairflix/db db:seed:local                   # optional dev seed
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
pnpm --filter @pairflix/db db:migrate:local    # wrangler d1 migrations apply pairflix-db --local
pnpm --filter @pairflix/db db:seed:local       # wrangler d1 execute ... --local --file seed.sql

# inspect the local DB
pnpm exec wrangler d1 execute pairflix-db --local --command "select * from households"
```

The local D1 lives under `.wrangler/` and is disposable — delete it and re-migrate to reset.

## Environment & secrets

- **Local Worker vars** go in `services/api/.dev.vars` (gitignored): `TMDB_API_KEY`,
  `ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS`, etc. Missing optional keys degrade gracefully (the LLM
  re-rank and provider fetch log-and-skip rather than fail), matching creatorgrid's
  "unconfigured is a valid state" pattern.
- **Production secrets** are set with `wrangler secret put <NAME>` per Worker — never committed.
- **Frontend env** uses `VITE_*` in each app's `.env` (e.g. `VITE_API_URL`).

## Deploy

```bash
pnpm --filter @pairflix/db db:migrate:remote   # apply migrations to prod D1 first
pnpm --filter @pairflix/api deploy             # wrangler deploy (Worker)
# Pages apps deploy via wrangler / CI per app
```

Worker and Pages roll back differently; the deploy runbook lives alongside this file once the cutover
phase lands. Until then, see creatorgrid's `docs/deploying.md` for the reference procedure.

## Troubleshooting

- **`wrangler dev` can't find the DB** — run `db:migrate:local` first; the binding name is `DB`, the
  database name is `pairflix-db` (see `services/api/wrangler.jsonc`).
- **A `packages/*` change isn't picked up** — Turborepo caches builds; `pnpm build` the changed
  package, or run `pnpm dev` which watches. Shared-package edits affect both apps — type-check both.
- **Auth/CSRF failures in local dev** — the client must fetch `GET /api/auth/csrf-token` and echo the
  `csrfToken` cookie back as `x-csrf-token` on writes; check `ALLOWED_ORIGINS` includes your dev
  origin.
