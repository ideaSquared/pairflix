# Pairflix architecture

> **Cloudflare stack (ADR 0001).** The re-platform off Express + Sequelize + Postgres is code-complete
> — `docs/roadmap.md` tracks phase history. What's not yet done is standing up the real Cloudflare
> infrastructure this describes (a provisioned D1 database, an actual `wrangler deploy`) — see
> Deploying, below. Where this document and the code disagree, the code is the current engineering
> reality and this document is the destination.

## Goal

Return **one** agreed title for a household in under 30 seconds, with cross-platform availability on
the card, at a marginal cost close to zero. The product is **one Worker + one D1 database serving
many households** — not per-tenant infrastructure, and not a fleet of services.

## Topology

```
                 ┌──────────────────────────────┐
   couples  ───► │ apps/client (Pages SPA)       │──┐
                 │  browse · Tonight picker ·     │  │  /api/*
                 │  history · upgrade             │  │
                 └──────────────────────────────┘  ▼
                 ┌──────────────────────────────┐ ┌───────────────────────────┐
   admins   ───► │ apps/admin (Pages SPA)        │►│ services/api (Worker, Hono)│
                 │  users · content moderation    │ │  ├─ fetch:     REST API     │
                 └──────────────────────────────┘ │  └─ scheduled: cron refresh │
                                                   └────────┬──────────┬─────────┘
                                                            ▼          ▼
                                                        D1 (SQLite)  R2 (optional)
                                                            ▲
                          external ─── TMDb (titles + /watch/providers) ─── Anthropic (premium re-rank)
```

- **Static SPAs are free and global** on Cloudflare Pages, cached at the edge.
- **The API is a single Worker.** Route modules (`services/api/src/routes/*`) are the seams along
  which it could later split if scale ever demands it — it will not for a long time.
- **D1** holds every household in one SQLite database (row-level tenancy). **R2** is reserved for any
  imagery we choose to own; posters stream from the TMDb CDN today.
- **Edge cache** (Cache API / KV) fronts TMDb `/discover` and `/watch/providers` — the pick path's
  slowest step is the external round-trip, not the DB.

## The pick path (what the 30-second SLO is about)

`POST /api/households/:id/pick` with `{ mood, minutesBudget, region? }`:

1. **Session middleware** resolves the caller from the `session` cookie (D1 lookup).
2. **Membership check** — caller must be a `household_members` row for `:id`.
3. **Entitlement + quota middleware** — region lock (free = GB) and the daily pick limit (free = 3);
   premium is unlimited and multi-region.
4. **Recommendation service** (`services/api/src/lib/recommendation.ts`): merge the members'
   taste profiles (D1) → TMDb `/discover` → score against mood/time/taste → hydrate the top
   candidates and filter to titles actually streamable on the household's providers. Edge-caching
   `/discover` and `/watch/providers` (Topology, above) isn't implemented yet in the Hono port --
   deferred to the providers/history domain (see `lib/tmdb.ts`).
5. **LLM re-rank** — premium only, behind `recommendation.llm_rerank`: the Worker calls Anthropic
   over `fetch` to re-order the shortlist; returns `null` to fall back to the pure-ML order. Never on
   the free path.
6. Return **one** title with its provider deep-links. Record `pick_usage` (quota) and a `proposed`
   `pick_events` row (funnel).

Accept / swap / dismiss and provider-launch are follow-up calls that append `pick_events` and, on
commit, a `watched_together` row.

## Household tenancy

The **household** is the tenant. Every household-scoped endpoint resolves the caller's membership
first; `household_members.role` (`owner` | `member`) gates owner-only actions (invites, billing).
There is no `owner_id` column — ownership lives on the membership row.

## Data model

Full schema in `docs/db-schema.md`; source of truth is `packages/db/src/schema.ts` (Drizzle).
Pivot tables: `households`, `household_members`, `taste_profiles`, `watched_together`,
`household_invites`, `subscriptions`, `pick_usage`, `pick_events`, plus `content` (the TMDb cache,
carrying the region-keyed `providers` map). Auth adds `sessions` and `auth_tokens`. This is
pre-launch alpha with no production data, so the old `matches` / `watchlist_entries` tables are **not**
carried into D1 — the schema is greenfield for the household product.

## Auth & CSRF

Ported from creatorgrid (the Workers-native pattern; replaces JWT bearer). Implemented in
`services/api/src/routes/auth.ts`, `routes/me.ts`, `middleware/auth.ts`, `middleware/csrf.ts`:

- **Opaque session token**, stored in D1 (`sessions`), carried in an HttpOnly `session` cookie.
- **Passwords hashed with PBKDF2 via Web Crypto** — Workers has no native bcrypt.
- **Double-submit CSRF** on state-changing requests: a readable `csrfToken` cookie echoed back as an
  `x-csrf-token` header, compared with `timingSafeEqual`.
- Sensitive changes (password reset, 2FA disable, etc.) revoke other sessions.
- **TOTP 2FA**, required for admin accounts (`requireAdmin` 403s until enrolled), optional for
  everyone else — enroll/verify/disable at `POST /api/me/2fa/*`.

## Recommendation & LLM re-rank

The recommender is **heuristic**, not a heavyweight ML pipeline: taste-profile merge → TMDb
`/discover` → score → provider filter. Implemented in `services/api/src/lib/recommendation.ts` and
`lib/llm.ts`. The optional Anthropic re-rank (`claude-sonnet-4-6`, `max_tokens: 512`, 8s timeout,
prompt-cached system + taste blocks, tool-use for structured output) is premium-gated
(`recommendation.llm_rerank` plus a per-household entitlement check) and **is wired into the
recommender**: eligible households hydrate the top 10 scored candidates instead of 3 and pass them
to `maybeRerank`, which validates the model's chosen id against what was actually sent and falls
back to the pure-ML top-1 pick on any failure (flag off, not premium, API error, timeout).

## Providers & regions

TMDb `/watch/providers` responses are read-through cached into `content.providers` (region-keyed,
one row per `(tmdbId, mediaType)`) with a 24h blob-level staleness check -- implemented in
`services/api/src/lib/providers.ts`. Caching is lazy/on-demand only;
there's no cron-driven proactive refresh yet (see Background work, below). Region defaults to GB,
overridable by premium multi-region wherever a household context exists (`/:id/pick`, `/:id/history`,
`/:id/picks/:tmdbId/launch`) -- these are the only provider-data reads the API exposes; a standalone,
non-household-scoped `GET /api/providers/:tmdbId` existed briefly but was deleted (no callers
anywhere, and no household context to resolve entitlements from -- see `docs/roadmap.md`).
Provider-launch (`lib/providerLaunch.ts`) resolves a provider slug + region to a deep link through
the same cache; the link is TMDb's own "watch this title" page, not a per-provider affiliate URL --
there's no affiliate-tagging scheme anywhere in this codebase today.

## Entitlements & quota

`free` = 3 picks/day, GB region-lock; `premium` = unlimited picks, multi-region, LLM re-rank.
Implemented as Hono middleware over D1 (`pick_usage` is the daily counter; `subscriptions` is the
tier source of truth). Premium requires `tier = 'premium' AND status = 'active' AND
current_period_end > now`.

## Billing

Real Stripe is still deferred (CLAUDE.md). What's implemented in `services/api/src/lib/billing.ts`
is Pairflix's existing mock pattern, household-scoped
under `/households/:id/billing/*` (owner-only): `checkout` returns a fake URL with no DB write,
`mock-activate` unconditionally flips the household to premium for 30 days behind a
`BILLING_MOCK_ENABLED` var ("unconfigured is a valid state" — enabled outside `production`,
matching the pattern CLAUDE.md's Stripe section describes; 404s when disabled, so it isn't
discoverable outside dev/demo use), and `cancel` sets `status: 'canceled'` without touching
`current_period_end`. There's no webhook yet — the current one is a no-op stub with no signature
verification and no DB effect, so it isn't ported; it lands for real, HMAC-verified, alongside
actual Stripe.

## Admin

Implemented in `services/api/src/routes/admin.ts`, mounted at `/api/admin` behind `requireAdmin`
(role + TOTP, same session as everyone else — no separate admin login). Covers user management
(CRUD, a single consolidated status-change endpoint that revokes sessions and emails the user on
suspend/ban, forced password reset, locked-accounts using the same threshold `/auth/login` enforces,
session termination that's genuinely immediate since a Hono session row is the live credential),
audit logs, settings (`services/api/src/lib/adminSettings.ts` -- generic key/value CRUD over
`settings`, matching
`lib/featureFlags.ts`'s existing no-cache read pattern), and content moderation over
`content`/`content_reports`. Express's larger
stats/activity surface mostly isn't ported -- it read the `activity_log`/`matches`/
`watchlist_entries` tables the re-platform drops, or Postgres/Node-process introspection with no
Workers equivalent -- replaced with one `GET /api/admin/dashboard-stats` built from tables that
still exist.

## Background work (cron)

Target: a Workers **cron trigger** running provider-cache refresh and taste-profile recompute, so a
cache miss never blocks a request. Not implemented yet -- today provider caching is entirely
lazy/on-demand (see Providers & regions, above), matching what the Express version it replaces did.
Processing would be inline to start (no Cloudflare Queues, which need the Workers Paid plan); move
to a queue only when volume justifies the plan, exactly as creatorgrid defers it.

## Deploying

One Worker (`services/api`) + two Pages apps, all via `wrangler` (`pnpm --filter @pairflix/api
deploy`, `pnpm --filter <app> deploy`) — no Docker or nginx in the app path. D1 migrations apply
with `wrangler d1 migrations apply --remote`. First-time deploy, new versions, and rollbacks follow
the `dev-setup.md` runbook. **Not done yet:** no D1 database has been provisioned in a Cloudflare
account (`wrangler.jsonc`'s `database_id` is still a placeholder) and no CI deploy step exists —
both need real Cloudflare account access, not just code.
