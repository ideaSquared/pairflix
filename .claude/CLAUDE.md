# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes, plus the Pairflix-specific conventions that override or extend them.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

> **Cloudflare stack — ADR 0001.** Pairflix runs on **pnpm + Turborepo**, `apps/*` + `services/*` +
> `packages/*`, a **Hono** Worker API, **Drizzle + D1**, **R2**, and **Cloudflare Pages** frontends —
> mirroring the `creatorgrid` sibling repo. The re-platform off Express + Sequelize + Postgres is
> code-complete (`docs/roadmap.md` tracks phase history); provisioning real Cloudflare infrastructure
> (a live D1 database, an actual `wrangler deploy`) is the remaining step, documented as a known gap
> in `docs/dev-setup.md`. Read `docs/adr/0001-cloudflare-stack.md`, `docs/architecture.md`, and
> `docs/db-schema.md` before structural work.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Pairflix — Development Guidelines

## What Pairflix is

Pairflix is the "what should WE watch tonight" decision layer for couples and households. Given a household, a mood, and a time budget, the product returns **one** title in under 30 seconds, with cross-platform availability (Netflix / Prime / Disney+ …) surfaced on the card. Premium adds unlimited picks, multi-region providers, and LLM-assisted re-ranking.

Product source of truth: the **Pairflix — Business Plan** Notion page (`https://www.notion.so/ba9c9af72f9a4f448b554378d8dc43b4`) and the venture page at `ideasquared-website/ventures/pairflix/`. When the plan and the codebase disagree, the plan wins for product intent; the codebase wins for engineering reality. Flag the conflict and ask.

## Two migrations are in flight

1. **Product pivot (mostly shipped):** user-to-user matching → title matching for an already-paired
   household. Scaffolds A–E (households/taste/watched-together, the ML recommender +
   `POST /households/:id/pick`, the feature-flagged LLM re-rank, providers + history, freemium
   entitlements) are merged. This is **pre-launch alpha with no production data** — the old matching
   and watchlist flows are being deleted, not preserved. There is nothing to keep backwards-compatible
   and no data to migrate; when the old code doesn't serve the household product, remove it.
2. **Platform re-platform (done, ADR 0001):** Node/Express/Sequelize/Postgres → Cloudflare
   (Hono/Drizzle/D1, pnpm/Turborepo). Phase history in `docs/roadmap.md`. Docker/nginx are gone from
   the app path; provisioning a real D1 database and wiring an actual deploy are what's left (see the
   banner above).

Extend along the existing seams. Don't introduce parallel structures.

## Quick Reference

- TypeScript strict everywhere; no `any` outside of test fixtures or vendored shims.
- **Vitest** in `services/api` (via `@cloudflare/vitest-pool-workers` against local D1); **Jest** +
  React Testing Library in the frontend workspaces (`apps/client`, `apps/admin`, `packages/lib.components`).
- **API (`services/api`):** Hono route modules (`src/routes/*`) → middleware (`src/middleware/*`) →
  business logic (`src/lib/*`) → Drizzle (`packages/db`) → D1. Route modules stay thin.
- Frontend: feature folders, React Query for server state, vanilla-extract for styling,
  `packages/lib.components` for primitives.
- One schema change = one Drizzle migration. Document it in `docs/db-schema.md` in the same PR.
- Commits on a feature branch off `master`. Never on `master` directly. Never push unless asked.

**Preferred tools:**

- **Language:** TypeScript (strict mode)
- **Package manager / build:** pnpm 10 + Turborepo
- **API:** Hono on Cloudflare Workers
- **Data:** Drizzle ORM on Cloudflare D1 (SQLite); R2 for blobs
- **Auth:** opaque session cookie in D1 + PBKDF2 (Web Crypto) + double-submit CSRF
- **Frontend:** React 18/19, Vite, vanilla-extract, React Query, React Router — on Cloudflare Pages
- **Tests:** Vitest (`@cloudflare/vitest-pool-workers`) for `services/api`; Jest + React Testing
  Library for the frontend workspaces
- **External:** TMDb (titles + providers), Anthropic API (LLM re-rank, opt-in), Stripe (deferred)

---

## Monorepo Architecture

pnpm workspaces + Turborepo. Layout mirrors `adopt-dont-shop` / `creatorgrid`:

```
pairflix/
├── apps/client/        # user SPA (Vite + React) on Pages — wrangler.jsonc
├── apps/admin/         # admin SPA on Pages — wrangler.jsonc
├── services/api/       # Hono Worker — wrangler.jsonc (routes / middleware / lib)
├── packages/db/        # Drizzle schema + client + SQL migrations
├── packages/lib.components/   # shared UI primitives
├── packages/lib.*/     # shared types / api client / utils / validation
└── docs/               # ADRs, architecture, schema, decision log, roadmap
```

### Key commands

Run from repo root unless stated.

```bash
pnpm install                     # install every workspace
pnpm dev                         # turbo: Worker + both Pages apps in parallel
pnpm --filter @pairflix/api dev  # just the Worker (wrangler dev, :8787)
pnpm build                       # turbo build
pnpm test                        # turbo test (vitest)
pnpm lint | pnpm format
pnpm -r type-check               # tsc --noEmit per workspace

# database (local D1 via Miniflare)
pnpm --filter @pairflix/db db:generate         # drizzle-kit generate
pnpm --filter @pairflix/db db:migrate:local    # wrangler d1 migrations apply --local
pnpm --filter @pairflix/db db:seed:local
```

Full setup in `docs/dev-setup.md`.

### Monorepo rules

1. **Workspace deps** use `workspace:*` (e.g. `"@pairflix/db": "workspace:*"`).
2. Changes to a `packages/*` lib affect its consumers — type-check them before declaring done.
3. Each workspace has its own `package.json`, `tsconfig.json`, `wrangler.jsonc` (apps/services), and tests.
4. **2-space indentation everywhere** (Prettier-enforced), matching the sibling repos.

---

## Testing Principles

### Behaviour-driven

- Test through public APIs. Don't mirror internal structure 1:1.
- New `lib` module ⇒ one happy-path + one failure-mode test, minimum.
- API routes with non-trivial logic get an integration test via `@cloudflare/vitest-pool-workers`
  (real Hono app, real local D1) — the equivalent of the old supertest route tests.
- Tests follow the same TypeScript strict rules as production code.
- Co-locate tests with their subject: `recommendation.ts` ↔ `recommendation.test.ts`.

### Tools

- **Vitest** in `services/api`, under `@cloudflare/vitest-pool-workers` (Miniflare D1/R2).
- **Jest** + **React Testing Library** in `apps/*` and `packages/lib.components`.

### Don't

- Don't test framework code (Drizzle internals, React Router internals).
- Don't write snapshot tests for anything you wouldn't catch a bug in.
- Don't mock what you own — extract a seam instead.

---

## TypeScript Guidelines

- **No `any`.** Use `unknown` if a type is truly unknown.
- **No `as` casts** unless commented with a one-line justification.
- **No `@ts-ignore` / `@ts-expect-error`** without a justification comment.
- **Prefer `type` over `interface`** for new declarations.
- Use utility types (`Pick`, `Omit`, `Partial`, `Required`).
- Domain types for IDs where it helps (`HouseholdId`, `UserId`).
- Request/response validation lives in `packages/lib.validation` (shared schemas). Reuse it; don't
  hand-roll per-endpoint validation.
- Run `wrangler types` (`cf-typegen`) so the Worker's `Env` bindings (DB, R2, vars) are typed.

---

## Code Style

- **No emojis in code** (identifiers, strings, comments). Emojis in existing `docs/*.md` are pre-existing — don't add more.
- **No comments unless WHY is non-obvious.** No "added for X", "used by Y", "TODO: maybe later". Such notes go in the PR description or `docs/decision-log.md`.
- **No defensive validation** beyond schema/middleware boundaries. Trust internal callers.
- **No backwards-compat shims** for code you're replacing in the same change.
- **Functional / immutable** preferred — `map/filter/reduce`, no mutation of inputs.
- **Early returns / guard clauses** over nested conditionals. Cap nesting at 2 levels in new code.

### Naming

- Functions: `camelCase`, verb-first.
- Types: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants; `camelCase` for config.
- Filenames: `dot.notation.ts` for modules (`recommendation.ts`, `auth.ts`), `PascalCase.tsx` for
  React components, `camelCase.ts` for hooks/utils.
- Test files: `*.test.ts` / `*.test.tsx`.

---

## Backend Patterns (Hono + Drizzle on Workers)

### Layering

```
Request → Hono route module → middleware → lib (business logic) → Drizzle → D1
                                     ↓
                                 Response
```

- **Routes** (`services/api/src/routes/*`): wire middleware + call into `lib`. No business logic.
- **Middleware** (`services/api/src/middleware/*`): auth (session), CSRF, rate limiting,
  entitlements/quota. Mount explicitly per route group — no implicit gating.
- **Business logic** (`services/api/src/lib/*`): pure-ish, easily testable (recommendation, providers,
  entitlements, history, household, billing).
- **Data** (`packages/db`): Drizzle schema + typed client. The DB handle comes from the Worker `Env`
  binding, passed down — never a module-level singleton.

### Drizzle & D1

- Schema in `packages/db/src/schema.ts`. JSON columns use `text({ mode: 'json' }).$type<T>()`;
  timestamps use `integer({ mode: 'timestamp_ms' })`; booleans `integer({ mode: 'boolean' })`.
- Index every column you'll filter / join on.

### Migrations

- SQL under `packages/db/migrations/`, generated with `drizzle-kit generate`, applied with
  `wrangler d1 migrations apply pairflix-db --local|--remote`.
- **Never modify a shipped migration.** Create a new one.
- Document new tables/columns in `docs/db-schema.md` in the same PR.

### Auth

- Session-cookie based: the `session` cookie holds an opaque token looked up in D1; `requireAuth`
  middleware populates the caller. Passwords are PBKDF2 (Web Crypto — **no bcrypt on Workers**).
- State-changing requests carry a double-submit CSRF token (`x-csrf-token` vs the `csrfToken` cookie).

### Rate limiting

- D1-backed middleware (creatorgrid's `ip-rate-limit` / `admin-rate-limit` pattern) — counts recent
  rows in a window. Extend the existing middleware; don't introduce a parallel limiter.

### Logging & errors

- Prefer the shared logger; the Worker's `console` output is captured by Cloudflare observability, but
  don't leave stray debug logs in checked-in code.
- Custom error classes (`NotFoundError`, `ValidationError`, …) carry a `statusCode`; a Hono `onError`
  handler translates them to the error response shape. Throw from `lib`; don't `try/catch` to swallow.

---

## Frontend Patterns (React + Vite on Pages)

### Folder layout

```
apps/client/src/
  features/<domain>/    # pages, components, hooks, types — owned by one feature
  components/           # cross-feature UI not yet promoted to packages/lib.components
  contexts/             # auth, theme
  hooks/                # cross-feature hooks
  services/             # API clients calling /api
  utils/
```

Promote a component to `packages/lib.components` only when a second consumer needs it.

### Components & data

- **Functional only.** Props as `type`, destructured in the signature. One component per file.
- **React Query for server state.** No bare `useEffect(fetch…)`. Each feature exposes a `useThing()`
  hook; mutations `useMutation` + invalidate query keys.
- **vanilla-extract** (`Component.css.ts` colocated with `Component.tsx`) with theme tokens (`vars`)
  from `packages/lib.components`. Pull primitives from `lib.components` before reaching for a `div`.
  No CSS modules, no Tailwind, no styled-components.

### Auth & API

- Auth is **cookie-based** — the browser sends the `session` cookie automatically. There is **no token
  to store or attach**; never touch `localStorage` for auth. The API client fetches the CSRF token and
  echoes it on writes.
- All calls go through the service clients in `apps/*/src/services/` (or `packages/lib.api`).

---

## API Design

- REST-ish, mounted at `/api`.
- Resource-oriented paths: `/households`, `/households/:id/pick`, `/households/:id/history`.
- `POST` for create + actions, `PATCH` for partial updates, `DELETE` for delete.
- Auth: session cookie + CSRF header on writes.
- Error response shape: `{ error: string, details?: string[] }`.
- Paginated response shape: `{ data: T[], pagination: { page, limit, total, totalPages } }`.

---

## External integrations

### TMDb

- Single API key in the `TMDB_API_KEY` Worker var. Fetch only from the Worker (`services/api`), never
  from `apps/*`. Edge-cache `/discover` and `/watch/providers`. Provider data is best-effort and
  region-locked — degrade gracefully.

### Anthropic API (premium LLM re-rank)

- Model `claude-sonnet-4-6`, `max_tokens: 512`, 8s timeout. Prompt-cache the system prompt and the
  per-member taste blocks; use **tool use** for structured output (never parse free-text JSON).
- Called from the Worker over `fetch`. Behind `recommendation.llm_rerank` (default off) and
  premium-gated. **The pure-ML path must work without it** — `rerankCandidates` (`lib/llm.ts`)
  returning `null`, throwing, or picking an id outside what was actually sent all fall through to
  the pure-ML top-1 pick.
- Wired into `pickForHousehold` (`lib/recommendation.ts`): eligible households hydrate the top 10
  scored candidates instead of 3 and pass them to `rerankCandidates`. Whether it actually improves
  first-pick acceptance is still unvalidated — see the roadmap.

### Stripe (deferred)

- Not integrated. When enabled, port creatorgrid's test-mode pattern (`lib/stripe.ts` +
  `routes/billing.ts`, "unconfigured is a valid state"). The mock checkout is for demos only.

---

## Development Workflow

1. **Branch** off `master` (or the user's stated branch). Never commit on `master`.
2. **Tests + code together** in the same commit.
3. **Commit format** (conventional-ish): `feat:`, `fix:`, `chore:`, `docs:` …
4. **No model identifiers, no marketing names** in commit messages, PR titles, or code.
5. **Pre-commit hooks** (husky + lint-staged) run lint + format. Never `--no-verify`.
6. **Don't push unless asked.** When asked, push and open a PR.

---

## Things to leave alone unless asked

- `apps/admin` — only touch if the task explicitly names admin scope.

## Working with Claude

1. Read this file, then `docs/adr/0001-cloudflare-stack.md`, `docs/architecture.md`, and
   `docs/db-schema.md` for context.
2. Before touching schema or a migration, confirm it doesn't conflict with the migration phase in
   `docs/roadmap.md`.
3. State assumptions. Ask before introducing new dependencies, new top-level folders, or new external services.
4. Match the existing style of the file you're editing — even when you'd do it differently.

When uncertain: surface the tradeoff, propose the simplest viable option, and ask.
