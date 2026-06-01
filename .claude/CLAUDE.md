# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes, plus the Pairflix-specific conventions that override or extend them.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

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

Product source of truth: the **Pairflix — Business Plan** Notion page (`https://www.notion.so/ba9c9af72f9a4f448b554378d8dc43b4`). When the Notion plan and the codebase disagree, the Notion plan wins for product intent; the codebase wins for engineering reality. Flag the conflict and ask.

## Active pivot — required context for every change

The codebase historically implemented **user-to-user matching** ("find a viewing partner"). It is pivoting to **title matching for an already-paired household** ("what should we watch"). The existing `Match` model (user pairing) is the seed for the new `Household` model — both coexist during the migration.

Five in-flight phase branches off `claude/inspiring-tesla-lAShW`:

- **A — `*-phase-a-models`** — `Household`, `HouseholdMember`, `TasteProfile`, `WatchedTogether`; `Content.providers` JSONB; first real Sequelize migration.
- **B — `*-phase-b-tonight`** — ML/CF recommender (`recommendation.service.ts`), `POST /api/v1/households/:id/pick`, `TonightPicker` UI. **No LLM in the hot path.**
- **C — `*-phase-c-llm`** — Anthropic SDK scaffold (`claude-sonnet-4-6`), prompt-cached system + taste-profile blocks, tool-use structured output, behind `recommendation.llm_rerank` (default off).
- **D — `*-phase-d-providers-history`** — TMDb `/watch/providers` fetch + cache, `ProviderBadges`, `WatchedTogether` history view with thumbs capture.
- **E — `*-phase-e-pricing`** — `Subscription`, `PickUsage`, entitlements + quota middleware, **mock checkout only** (no Stripe SDK yet).

Extend along these seams. Don't introduce parallel structures.

## Quick Reference

- TypeScript strict everywhere; no `any` outside of test fixtures or vendored shims.
- Jest + ts-jest in backend; Jest + RTL in the React workspaces.
- Backend: `routes/` → `controllers/` → `services/` → `models/`. Controllers stay thin.
- Frontend: feature folders, React Query for server state, styled-components for styling, `lib.components` for primitives.
- One schema change = one Sequelize migration. Document it in `docs/db-schema.md` in the same PR.
- Commits on a feature branch off `claude/inspiring-tesla-lAShW`. Never on `main`. Never push unless asked.

**Preferred tools:**

- **Language:** TypeScript (strict mode)
- **Backend:** Express 4, Sequelize 6, PostgreSQL 14+, JWT auth
- **Frontend:** React 18, Vite, styled-components, React Query, React Router
- **Tests:** Jest, ts-jest, supertest (backend), React Testing Library (frontend)
- **External:** TMDb (titles + providers), Anthropic API (LLM re-rank, opt-in), Stripe (reserved for Phase E)

---

## Monorepo Architecture

npm workspaces (no Turborepo). Four workspaces:

```
pairflix/
├── backend/            # Express + Sequelize API (port 8000, mounted at /api/v1)
├── app.client/         # User-facing React app (port 5173)
├── app.admin/          # Admin panel React app (port 5174)
├── lib.components/     # Shared component library (styled-components)
├── docs/               # Architecture, schema, decision log, phase roadmaps
└── scripts/            # Dev + migration helpers
```

### Key commands

Run from repo root unless stated.

```bash
# Install
npm install

# Dev
npm run dev:backend          # API server (port 8000)
npm run dev:client           # User app (port 5173)
npm run dev:admin            # Admin app (port 5174)

# Build
npm run build:all
npm run build:backend | build:client | build:admin | build:components

# Test
npm run test:all
npm run test:backend | test:client | test:admin | test:components

# Lint / format
npm run lint:all
npm run format:all

# Typecheck (per workspace)
cd backend && npx tsc --noEmit
cd app.client && npx tsc --noEmit
cd app.admin && npx tsc --noEmit
cd lib.components && npx tsc --noEmit

# Database (Docker is easiest)
docker-compose up -d postgres
```

### Monorepo rules

1. **Workspace deps** use `*` version (e.g. `"@pairflix/lib.components": "*"`).
2. Changes to `lib.components` affect both apps — typecheck both before declaring done.
3. Each workspace has its own `package.json`, `tsconfig.json`, and tests.
4. Indentation is **tabs in `backend/`**, **2-space in the React workspaces**. Match the file you're editing.

---

## Testing Principles

### Behaviour-driven

- Test through public APIs. Don't mirror internal structure 1:1.
- New service ⇒ one happy-path + one failure-mode test, minimum.
- API endpoints with non-trivial logic get a `supertest` integration test.
- Tests must follow the same TypeScript strict rules as production code.
- Co-locate tests with their subject: `auth.service.ts` ↔ `auth.service.test.ts`.

### Tools

- **Jest + ts-jest** in `backend/`.
- **Jest + React Testing Library** in `app.client`, `app.admin`, `lib.components`.
- **supertest** for backend route tests.

### Don't

- Don't test framework code (Sequelize internals, React Router internals).
- Don't write snapshot tests for anything you wouldn't catch a bug in.
- Don't mock what you own — extract a seam instead.

---

## TypeScript Guidelines

- **No `any`.** Use `unknown` if a type is truly unknown.
- **No `as` casts** unless commented with a one-line justification.
- **No `@ts-ignore` / `@ts-expect-error`** without a justification comment.
- **Prefer `type` over `interface`** for new declarations. Existing interfaces stay until touched.
- Use utility types (`Pick`, `Omit`, `Partial`, `Required`).
- Domain types for IDs where it helps (`HouseholdId`, `UserId`).
- Schemas (`zod` / similar) are not yet in the codebase. Don't introduce one for a single endpoint — talk first.

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
- Backend filenames: **`PascalCase.ts` for models**, **`dot.notation.ts` for everything else** (`auth.service.ts`, `match.routes.ts`).
- Frontend filenames: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils.
- Test files: `*.test.ts` / `*.test.tsx`.

---

## Backend Patterns (Express + Sequelize)

### Layering

```
Request → Route → Middleware → Controller → Service → Model → Postgres
                                       ↓
                                   Response
```

- **Routes** (`backend/src/routes/`): wire middleware + controller. No logic.
- **Controllers** (`backend/src/controllers/`): HTTP marshalling, status codes. No business logic.
- **Services** (`backend/src/services/`): all business logic, pure-ish, easily testable.
- **Models** (`backend/src/models/`): Sequelize schema + associations. Register in `models/index.ts`.

### Sequelize models

- One file per model, PascalCase.
- Register in `backend/src/models/index.ts` and define associations there, following the existing pattern.
- Use TypeScript enums for status fields. JSONB for flexible payloads (`providers`, `weights`, settings).
- Index every column you'll filter / join on.

### Migrations

- Live under `backend/src/db/migrations/` (introduced in Phase A — before then, schema was sync-driven).
- Sequentially numbered: `001-create-households.ts`, `002-add-providers-to-content.ts`.
- **Always implement `up` AND `down`.** Test both.
- **Never modify an existing migration.** Create a new one.
- Wrap multi-step changes in a single transaction.
- Document the new tables/columns in `docs/db-schema.md` in the same PR.

### Auth

- JWT bearer; `req.user` populated by `authMiddleware` in `backend/src/middlewares/`.
- Mount auth on every protected route explicitly — no implicit gating.

### Rate limiting

- Extend the existing `express-rate-limit` configs rather than introducing new instances.

### Logging

- Use the logger in `backend/src/utils/`. **No `console.log`** in checked-in code.

### Error handling

- Custom error classes (`NotFoundError`, `ValidationError`, etc.) extend `Error` with a `statusCode`.
- Throw from services; the error middleware in `backend/src/middlewares/` translates to HTTP.
- Don't `try/catch` to swallow — let the middleware handle it, unless you're adding context to the error and re-throwing.

---

## Frontend Patterns (React + Vite)

### Folder layout

```
app.client/src/
  features/<domain>/    # pages, components, hooks, types — owned by one feature
  components/           # cross-feature UI not yet promoted to lib.components
  contexts/             # auth, theme
  hooks/                # cross-feature hooks
  services/             # API clients calling /api/v1
  utils/
```

A feature owns its pages, components, hooks, and types. Promote a component to `lib.components` only when a second consumer needs it.

### Components

- **Functional only.** No class components in new code.
- Props as `type`, not `interface`. Destructure in the signature.
- One component per file; export the component as a named export.

### Data fetching

- **React Query for server state.** No bare `useEffect(fetch…)`.
- Each feature exposes a `useThing()` hook; components consume the hook.
- Mutations use `useMutation` + invalidate the relevant query keys.

### Styling

- **styled-components** with theme tokens from `lib.components/src/styles/`.
- Pull primitives from `lib.components` before reaching for a `div`.
- No CSS modules, no Tailwind, no vanilla-extract.

### Routing

- React Router. Add new routes in `App.tsx` alongside the existing tree.

### API calls

- All API calls go through the existing service clients in `app.*/src/services/`. They handle JWT attachment and base URL.
- Never read `localStorage` for tokens directly in a component — go through the auth context.

---

## API Design

- REST-ish, mounted at `/api/v1`.
- Resource-oriented paths: `/households`, `/households/:id/pick`, `/watchlists/:id`.
- `POST` for create + actions, `PATCH` for partial updates, `DELETE` for delete.
- Auth: JWT bearer in `Authorization: Bearer <token>`.
- Error response shape: `{ error: string, details?: string[] }`.
- Paginated response shape: `{ data: T[], pagination: { page, limit, total, totalPages } }`.

---

## External integrations

### TMDb

- Single API key in `TMDB_API_KEY`.
- Use the existing client in `backend/src/services/tmdb.service.ts`. Don't fetch from `app.*`.
- Treat provider data as best-effort and region-locked. Degrade gracefully.

### Anthropic API (Phase C only)

- Model: `claude-sonnet-4-6`. `max_tokens: 512`. Timeout 8s.
- **Enable prompt caching** on the system prompt and the (stable per session) per-member taste-profile blocks.
- Use **tool use** for structured output. Never parse free-text JSON.
- Off by default behind `recommendation.llm_rerank`. The pure-ML path must work without it.
- Don't call from the frontend. All LLM calls go through `backend/src/services/llm.service.ts`.

### Stripe (Phase E — reserved)

- The `stripe` npm package is **not yet integrated.** Don't import it until go-live is signed off.
- The mock checkout (`MockCheckout.tsx`) is for demos only.

---

## Development Workflow

1. **Branch** off `claude/inspiring-tesla-lAShW` (or the user's stated branch). Never commit on `main`.
2. **Tests + code together** in the same commit.
3. **Commit format** (conventional-ish):
   - `feat: add household pick endpoint`
   - `fix: handle missing TMDb provider data`
   - `chore: bump tmdb client timeout`
   - `docs: expand pick algorithm rationale in decision log`
4. **No model identifiers, no marketing names** in commit messages, PR titles, or code.
5. **Pre-commit hooks** (husky + lint-staged) run lint + format. Never `--no-verify`.
6. **Don't push unless asked.** When asked, push and open a draft PR by default.

---

## Things to leave alone unless asked

- The existing user-to-user `Match` flow. It still ships; the pivot is additive.
- `app.admin` — only touch if the task explicitly names admin scope.
- `docker-compose.prod.yml` and the `nginx/` configs — production deployment is owned outside agent scope.

## Working with Claude

When working in this repo:

1. Read this file first, then `docs/architecture.md` and `docs/db-schema.md` for context.
2. Before touching a model or migration, confirm it doesn't conflict with the active phase branches.
3. State assumptions. Ask before introducing new dependencies, new top-level folders, or new external services.
4. Match the existing style of the file you're editing — even when you'd do it differently.

When uncertain: surface the tradeoff, propose the simplest viable option, and ask.
