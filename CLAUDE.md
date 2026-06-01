# Pairflix — Agent guide

This file is read by Claude Code at session start. Keep it concise and load-bearing. If you find yourself repeating an instruction in chat, codify it here instead.

## What Pairflix is

Pairflix is the "what should WE watch tonight" decision layer for couples and households, sitting on top of existing streaming subscriptions (Netflix, Prime, Disney+ …). Given a household, a mood, and a time budget, the product returns **one** recommended title in under 30 seconds. Premium adds unlimited picks, multi-region, and LLM-assisted re-ranking.

The canonical product spec lives in Notion: **Pairflix — Business Plan** (`https://www.notion.so/ba9c9af72f9a4f448b554378d8dc43b4`). Treat it as the source of truth for product intent.

## Active pivot — context for every change

The codebase historically implemented **user-to-user matching** ("find a viewing partner"). It is being pivoted to **title matching for an already-paired household** ("what should we watch"). Both surfaces coexist during the migration; `Match` (user pairing) seeds `Household` (decision unit).

Five in-flight phases, each on a sub-branch of `claude/inspiring-tesla-lAShW`:

- **Phase A — `*-phase-a-models`** — `Household`, `HouseholdMember`, `TasteProfile`, `WatchedTogether`; `Content.providers` JSONB; first real Sequelize migration.
- **Phase B — `*-phase-b-tonight`** — ML/CF recommender (`recommendation.service.ts`), `POST /api/households/:id/pick`, `TonightPicker` UI. **No LLM in the hot path.**
- **Phase C — `*-phase-c-llm`** — Anthropic SDK scaffold (`claude-sonnet-4-6`), prompt-cached system + taste-profile blocks, tool-use structured output, behind feature flag `recommendation.llm_rerank` (default off).
- **Phase D — `*-phase-d-providers-history`** — TMDb `/watch/providers` fetch + cache, `ProviderBadges`, `WatchedTogether` history view with thumbs capture.
- **Phase E — `*-phase-e-pricing`** — `Subscription`, `PickUsage`, entitlements service + quota middleware, **mock checkout only** (no Stripe SDK yet).

Default to extending these along their existing seams rather than introducing a parallel structure.

## Repository layout

Monorepo, npm workspaces:

- `backend/` — Express + Sequelize + Postgres, TypeScript strict, API mounted at `/api/v1`. Port `8000` in dev.
- `app.client/` — React 18 + Vite + styled-components + React Query. Port `5173`.
- `app.admin/` — Admin panel, same stack as client. Port `5174`.
- `lib.components/` — Shared component library. Import from here before adding a new primitive.
- `docs/` — Architecture, schema, decision log, phase roadmaps. **Update `docs/db-schema.md` whenever a model changes.**
- `scripts/` — Dev + migration helpers.

## Commands

Run from repo root unless stated.

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev (all) | `npm run dev` |
| Dev (one) | `npm run dev:backend` \| `dev:client` \| `dev:admin` |
| Typecheck (per workspace) | `cd <workspace> && npx tsc --noEmit` |
| Build (all) | `npm run build:all` |
| Test (all) | `npm run test:all` |
| Test (one) | `npm run test:backend` \| `test:client` \| `test:admin` \| `test:components` |
| Lint | `npm run lint:all` (or `lint:<workspace>`) |
| Format | `npm run format:all` |

`npm run dev` expects Postgres reachable. Easiest: `docker-compose up -d postgres`.

## Conventions

### General
- TypeScript strict everywhere. No `any` outside of test fixtures or third-party shims.
- Tabs for indentation in `backend/`, 2-space in the React workspaces — match the file you're editing.
- No emojis in code, identifiers, or commit messages. Emojis in `docs/*.md` are pre-existing; do not add more.
- No comments unless WHY is non-obvious. No "added for X" or "used by Y" comments — those belong in the PR description.
- No defensive checks beyond schema/middleware boundaries. Trust internal callers.
- Don't add backwards-compat shims for code you're replacing in the same change.

### Backend
- Layering: `routes/` → `controllers/` → `services/` → `models/`. Controllers stay thin; business logic in services.
- File naming: models `PascalCase.ts`, everything else `dot.notation.ts` (e.g. `match.service.ts`, `auth.routes.ts`).
- Register every new Sequelize model in `backend/src/models/index.ts` and define associations there, matching the existing pattern.
- Sequelize migrations live under `backend/src/db/migrations/` (created in Phase A — before then, schema was sync-driven). New tables go via migration, not `sync({ alter: true })`.
- Auth: JWT bearer; `req.user` populated by `authMiddleware`. New protected routes mount it explicitly.
- Rate limiting: extend the existing `express-rate-limit` configs rather than rolling new ones.
- Logging: use the existing logger in `backend/src/utils/`. Do not add `console.log` to checked-in code.

### Frontend (client + admin)
- Feature folders under `app.client/src/features/<domain>/`. Each feature owns its pages, components, hooks, and types.
- Data fetching: React Query. No bare `useEffect(fetch…)`.
- Styling: styled-components, theme-aware. Use primitives from `lib.components` before reaching for a div.
- Routing: React Router. Add new routes alongside the existing tree in `App.tsx`.
- Forms: keep them controlled; reuse existing form primitives from `lib.components`.

### Database
- One schema change = one migration. Wrap multi-step changes in a transaction.
- JSONB for flexible/schemaless fields (`providers`, `weights`, settings). Index keys you'll filter on.
- Document new tables/columns in `docs/db-schema.md` in the same PR.

### Tests
- Jest across all workspaces; `ts-jest` in backend, RTL in frontend.
- Co-locate `*.test.ts` / `*.test.tsx` next to the file under test.
- New service ⇒ at least one happy-path + one failure-mode unit test. Don't test framework code.
- API endpoints get a `supertest` integration test if they introduce non-trivial logic.

### Git
- Always commit on a feature branch off `claude/inspiring-tesla-lAShW` (or the user's stated branch). Never commit on `main`.
- Conventional-ish commit messages (`feat:`, `fix:`, `chore:`, `docs:`). No model-identifier strings, no marketing names in commit messages, PR titles, or code.
- Do not push unless asked. After the user asks to push, open a draft PR by default.
- Never `--no-verify`, never force-push to `main`.

## External dependencies

- **TMDb** — title metadata, search, watch providers. Single API key in `TMDB_API_KEY`. Treat as best-effort; provider data is region-locked and patchy — degrade gracefully.
- **Anthropic API** — Phase C only. Model `claude-sonnet-4-6`. Enable prompt caching on the system prompt and the (stable per session) taste-profile blocks. Use tool-use for structured output, never free-text JSON parsing. Off by default behind `recommendation.llm_rerank`.
- **Stripe** — Phase E reserves the surface but the SDK is **not yet integrated**. Do not import `stripe` until the user signs off on go-live.

## Things to leave alone unless asked

- The existing user-to-user `Match` flow. It still ships; the pivot is additive.
- `app.admin` — only touch if the task explicitly names admin scope.
- `docker-compose.prod.yml` and the `nginx/` configs — production deployment is owned outside agent scope.

## When in doubt

- Notion business plan = product truth.
- `docs/architecture.md`, `docs/db-schema.md`, `docs/decision-log.md` = engineering truth.
- Existing patterns in neighbouring files = style truth.

If those three disagree, ask.
