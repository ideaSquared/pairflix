# PairFlix

The "what should WE watch tonight" decision layer for couples and households: given a household, a
mood, and a time budget, return **one** title in under 30 seconds, with cross-platform availability
(Netflix / Prime / Disney+ ...) surfaced on the card.

**Status: pre-launch alpha.** There is no production data and no exercised production deploy yet --
provisioning a real Cloudflare account, D1 database, and domain is the remaining step before that's
true. See `docs/roadmap.md` for phase history and `docs/architecture.md` for the full design.

## Architecture

A pnpm/Turborepo monorepo on Cloudflare (ADR 0001, `docs/adr/0001-cloudflare-stack.md`):

- **`apps/client/`** -- user-facing SPA (Vite + React), deployed to Cloudflare Pages
- **`apps/admin/`** -- admin SPA (Vite + React), deployed to Cloudflare Pages
- **`services/api/`** -- Hono Worker on Cloudflare Workers, backed by Drizzle ORM on Cloudflare D1
- **`packages/db/`** -- Drizzle schema + SQL migrations
- **`packages/lib.components/`** -- shared UI component library
- **`packages/lib.*/`** -- shared types / api client / validation
- **`docs/`** -- ADRs, architecture, schema, decision log, roadmap

No Docker, no nginx, no separate Node API server -- see `docs/architecture.md`'s topology diagram.

## Quick Start

### Prerequisites

- Node.js 22.x (see `.nvmrc`) and pnpm 10 (`corepack enable && corepack prepare pnpm@latest --activate`)
- A TMDb API key (and, for the premium LLM re-rank, an Anthropic API key)
- A Cloudflare account only for `--remote` / deploy -- local dev needs none (Miniflare emulates D1)

### Installation

```bash
git clone <repository-url>
cd pairflix
pnpm install
cp services/api/.dev.vars.example services/api/.dev.vars   # local Worker vars, then edit
pnpm --filter @pairflix/api db:migrate:local                # create + migrate the local D1
pnpm dev                                                     # Worker + both Pages apps, in parallel
```

- API (Worker): `http://localhost:8787`
- Client app: `http://localhost:5173`
- Admin app: `http://localhost:5174`

Full setup, seed data, and troubleshooting: [`docs/dev-setup.md`](./docs/dev-setup.md).

## Applications

### Client (`apps/client`)

The household's "Tonight" picker: mood + time budget in, one title out, with provider deep-links.
Also covers taste onboarding, pick history, and household/billing management.

### Admin (`apps/admin`)

Internal admin panel: user management, content moderation, audit logs, and settings. Only touch this
app if a task explicitly names admin scope (see `CLAUDE.md`).

### API (`services/api`)

Single Hono Worker: session-cookie auth with double-submit CSRF and optional/admin-required TOTP 2FA,
the household recommendation engine (with an optional premium LLM re-rank), TMDb-backed providers,
entitlements/quota, and admin routes. See [`services/api/README.md`](./services/api/README.md).

## Development

**Root level (Turborepo-orchestrated):**

```bash
pnpm dev          # start all dev servers in parallel
pnpm build        # build all workspaces
pnpm test         # run all test suites (Vitest)
pnpm lint         # lint all workspaces
pnpm format       # format with Prettier
pnpm type-check   # type-check all workspaces
```

**Individual workspaces** (`pnpm --filter <package> <script>`):

```bash
pnpm --filter @pairflix/api dev
pnpm --filter @pairflix/client dev
pnpm --filter @pairflix/admin dev
pnpm --filter @pairflix/components storybook
```

### Technology stack

- **Language:** TypeScript, strict everywhere
- **API:** Hono on Cloudflare Workers
- **Data:** Drizzle ORM on Cloudflare D1 (SQLite); R2 for blobs
- **Auth:** opaque session cookie in D1 + PBKDF2 (Web Crypto) + double-submit CSRF + optional/admin
  TOTP 2FA -- no JWT
- **Frontend:** React, Vite, vanilla-extract, React Query, React Router, on Cloudflare Pages
- **Tests:** Vitest everywhere -- `@cloudflare/vitest-pool-workers` (real Hono requests against a
  local Miniflare D1) for `services/api`; jsdom + React Testing Library for the frontend workspaces
- **External:** TMDb (titles + providers), Anthropic (premium LLM re-rank, opt-in), Stripe
  (scaffolded, not live)

## Database

Cloudflare D1 (SQLite) via Drizzle ORM: households, membership, taste profiles, watched-together
history, invites, subscriptions, pick usage/events, a TMDb content cache, sessions and auth tokens.
See [`docs/db-schema.md`](./docs/db-schema.md) for the full schema.

## Testing

```bash
pnpm test                                # all workspaces (Vitest)
pnpm --filter @pairflix/api test         # API integration tests (local D1)
pnpm --filter @pairflix/client test      # client unit/component tests
pnpm --filter @pairflix/components test  # component library tests
```

Playwright end-to-end tests live in `e2e/` and run via `.github/workflows/e2e.yml` (always on
`master`, opt-in on PRs via the `e2e` label).

## Documentation

- [Documentation Index](./docs/README.md) -- full documentation catalog
- [Development Setup](./docs/dev-setup.md) -- local dev, environment/secrets, first-time D1 setup
- [Architecture](./docs/architecture.md) -- system design, topology, the pick path, auth
- [Database Schema](./docs/db-schema.md) -- tables and relationships
- [Runbook](./docs/runbook.md) -- first production deploy, secrets, rollback, D1 backup
- [API Reference](./docs/api-docs.md) -- REST endpoints
- [Security](./services/api/docs/SECURITY.md) -- API security implementation
- [Roadmap](./docs/roadmap.md) -- phase history of the product pivot and platform re-platform
- [Decision Log](./docs/decision-log.md) -- record of architectural decisions
- [ADR 0001: Cloudflare stack](./docs/adr/0001-cloudflare-stack.md)

## Deployment

```bash
pnpm --filter @pairflix/api deploy      # wrangler deploy (Worker)
pnpm --filter @pairflix/client deploy   # wrangler pages deploy
pnpm --filter @pairflix/admin deploy    # wrangler pages deploy
```

`.github/workflows/deploy.yml` runs the same three deploys (plus D1 migrations) via
`workflow_dispatch`, deliberately not on push -- see that file's top comment and
[`docs/runbook.md`](./docs/runbook.md) for every prerequisite that has to exist first, including a
cookie/domain constraint that will make a first deploy look broken if skipped.

## Contributing

1. Branch off `master` (never commit directly to `master`)
2. Make your changes, with tests in the same commit
3. Run `pnpm lint`, `pnpm type-check`, and `pnpm test`
4. Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, ...)
5. Open a pull request

See `CLAUDE.md` for the full set of conventions this repo follows.

## License

No license file is currently published for this repository.
