# ADR 0001 — Re-platform Pairflix onto the Cloudflare stack

- **Status:** Accepted
- **Date:** 2026-08-16
- **Deciders:** Alex Jenkinson
- **Supersedes:** the implicit Express + Sequelize + Postgres + npm-workspaces stack described in the pre-pivot `.claude/CLAUDE.md`

## Context

Pairflix has pivoted from user-to-user watchlist matching to the household "what should
WE watch tonight" decision layer: given a household, a mood, and a time budget, return **one**
agreed title in under 30 seconds, with cross-platform provider availability on the card. The
product is **pre-launch alpha with no public users and no production data.**

The current stack is an npm-workspaces monorepo — `backend/` (Express 4 + Sequelize 6 + Postgres),
`app.client/` and `app.admin/` (React + Vite), `lib.components/` — deployed via multi-stage Docker
behind nginx.

Two sibling ventures in the ideaSquared studio set the precedent for a house monorepo convention:

- **adopt-dont-shop** — pnpm + Turborepo, `apps/` + `services/` + `packages/`, shared eslint/tsconfig
  config packages. Its *runtime* is a fleet of Fastify microservices (auth, pets, rescue,
  applications, chat, moderation, matching, cms, notifications, audit + a gateway) on Postgres/PostGIS,
  NATS, and Redis, self-hosted in Docker behind nginx with a full Grafana/Loki/Prometheus/Tempo
  observability stack.
- **creatorgrid** — the *same* pnpm + Turborepo + `apps/`/`services/`/`packages/` skeleton, but
  Cloudflare-native: a single Hono Worker (`services/api`), Drizzle + D1 (SQLite), R2 for blobs,
  React/Vite SPAs on Pages, cron-triggered background work, and an explicit "deploy for free" model.

The monorepo *layout* is identical between the two siblings; the only real difference is the backend
**runtime and database**. That is the decision recorded here.

## Decision

**Adopt the Cloudflare stack, mirroring creatorgrid, with D1 as the database.**

- **Monorepo:** pnpm 10 + Turborepo, workspaces `apps/*` + `services/*` + `packages/*`, with shared
  `eslint-config-*`, `tsconfig.*.base.json`, husky, commitlint, and `vitest.shared.config.ts`
  lifted from the sibling repos.
- **API:** a single **Hono** Worker at `services/api`, route modules under `src/routes/*` (households,
  pick, providers, history, billing, admin, auth) as the seams.
- **Database:** **Drizzle ORM on D1** (SQLite). Schema in `packages/db/src/schema.ts`; migrations as
  SQL under `packages/db/migrations/` applied with `wrangler d1 migrations apply`.
- **Blobs:** **R2** (optional at first — posters come from the TMDb CDN; reserve R2 for any cached
  imagery we choose to own).
- **Background work:** Workers **Cron triggers** for provider-cache refresh and taste-profile
  recompute (inline processing first; Cloudflare Queues only if/when we take the Workers Paid plan,
  exactly as creatorgrid defers it).
- **Frontends:** `apps/client` and `apps/admin` as React 19 + Vite SPAs on **Cloudflare Pages**, each
  with its own `wrangler.jsonc`.
- **Shared UI:** `lib.components` becomes `packages/lib.components`.
- **Edge caching:** TMDb `/discover` and `/watch/providers` responses cached at the edge
  (Cache API / KV) — the pick path's slowest step is the external round-trip, not the DB.

We **borrow the layout from both siblings and the runtime from creatorgrid.** Where creatorgrid has
already solved a cross-cutting concern (session auth, CSRF, cron sync, test-mode Stripe), we port its
solution rather than reinvent it.

## Options considered

Reviewed against the requirements that discriminate at this stage: pre-launch with **no production
data**, a small team on a tight seed (**cost + ops burden dominate**), spiky consumer traffic, a pick
latency **bottlenecked on external TMDb calls not the DB**, a **small read-mostly relational** dataset
with **no geospatial** need, and a desire for **cross-venture consistency**.

### A. Cloudflare + D1, mirroring creatorgrid — **chosen**

- Best fit on the axes that matter for an alpha: scales to zero, no infra or observability fleet to
  run, edge-native latency and region detection, maximal consistency with creatorgrid.
- **The D1 risk is proven down:** creatorgrid is a live consumer SaaS running auth, sessions, 2FA,
  audit logs, click analytics, Stripe billing, and cron sync entirely on D1. Pairflix's data needs
  are comparable or lighter.
- Pre-launch with zero production data is the cheapest moment we will ever have to leave Postgres.
- **Cost:** a genuine backend rewrite (see Consequences). Accepted — small surface, existing logic to
  port, proven reference.

### B. Cloudflare frameworks + Neon Postgres — rejected (the hedge)

Same Hono + Drizzle + Pages, but on Neon serverless Postgres instead of D1. Keeps full SQL power and
lowers data-migration risk, and Drizzle would make it portable to Workers + Hyperdrive later. Rejected
because D1 is already proven for this product class in-studio, it adds another managed service, and it
is less consistent with creatorgrid. **Retained as the documented fallback** if D1 ever proves
limiting or the product grows into a heavy relational/analytical platform.

### C. adopt-dont-shop runtime (Fastify + Postgres + Docker) — rejected

House layout plus adopt's runtime: a Fastify microservice fleet on Postgres/PostGIS, NATS, Redis,
Docker, nginx, and full observability. All of that machinery exists because adopt serves many domains;
Pairflix is one bounded product in alpha. Always-on cost and ops burden are the opposite of what this
stage needs, and adopt's PostGIS justification (pet geo-search) does not apply here. The valuable thing
to borrow from adopt is its *layout, ADR discipline, and quality gates* — which are the same layout
creatorgrid uses anyway — not its runtime.

### D. Convention only, keep Express/Sequelize/Postgres — rejected

Move to pnpm + Turborepo but keep the current runtime. Lowest immediate risk, but it pays the
restructuring cost now and defers the data-bearing Postgres migration to after launch, at the worst
possible time — or never, forgoing the cost and consistency wins entirely.

## Consequences

**Rewrites (staged — see Migration):**

- **Express → Hono.** Route/controller/middleware layering maps onto Hono route modules + middleware.
  `express-rate-limit` → a D1-backed rate-limit middleware (creatorgrid's `ip-rate-limit` pattern).
- **Sequelize → Drizzle + D1.** The household product's tables become one `schema.ts`, authored fresh
  rather than data-migrated — this is alpha with no production data, so legacy matching/watchlist
  tables are dropped, not carried. No PostGIS needed. JSONB columns (`providers`, taste `weights`)
  become `text` holding JSON — a standard SQLite pattern.
- **Auth model changes.** JWT bearer → creatorgrid's **opaque session cookie stored in D1** with
  **PBKDF2 via Web Crypto** (Workers has no native bcrypt) and double-submit CSRF. This is the single
  biggest behavioural change and the one most worth watching during the port.
- **Tests:** supertest integration tests → `@cloudflare/vitest-pool-workers` against local Miniflare
  D1. (Pivot endpoints currently have no integration tests, so this is largely net-new.)

**Unchanged in spirit:**

- **LLM re-rank (premium, Anthropic).** A Worker calls the Anthropic API over `fetch`; prompt caching
  and tool-use are unaffected; the 8s timeout fits Workers limits. This path is currently dead code
  (built but never called) and gets wired in as recommendation moves.
- **Billing.** Stays mock/deferred; when enabled, port creatorgrid's test-mode Stripe pattern
  (unconfigured-is-a-valid-state).
- **Entitlements/quota** (free = 3 picks/day, GB region-lock; premium = unlimited) become Hono
  middleware over D1 — same logic.

**New constraints accepted:**

- **D1/SQLite limits** (single-writer, per-DB size ceiling). Fine for a small, read-mostly schema;
  revisit only far beyond the Year-1 target. Fallback is Option B.
- **Cloudflare platform lock-in** — deliberate, for the cost profile and cross-venture consistency.

## Migration (high level — detailed plan lives in the roadmap)

1. **Restructure** to pnpm + Turborepo + `apps`/`services`/`packages`. App keeps running on the
   existing Node runtime through this step.
2. **Data layer:** author the household schema fresh in Drizzle + D1 (no data migration — alpha);
   drop legacy tables the product doesn't use.
3. **API:** port route modules to a Hono Worker, one domain at a time (auth → households/pick →
   providers/history → billing/admin), wiring the LLM re-rank in as recommendation moves.
4. **Frontends:** move `app.client`/`app.admin` to `apps/*` on Pages; `lib.components` to `packages/`.
5. **Cut over** dev + deploy to wrangler; retire Docker/nginx from the app path.

Each step is independently reviewable; nothing is merged without the docs in this set updated to match
(this ADR, `architecture.md`, `db-schema.md`, `CLAUDE.md`, `dev-setup.md`).
