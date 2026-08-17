# Pairflix architecture

> **Target state (ADR 0001).** This describes the Cloudflare stack Pairflix is moving to. The
> codebase is mid-migration off Express + Sequelize + Postgres — `docs/roadmap.md` tracks which phase
> each piece is in. Where this document and the code disagree, the code is the current engineering
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
4. **Recommendation service** (`services/api/src/hono/lib/recommendation.ts`): merge the members'
   taste profiles (D1) → TMDb `/discover` (edge-cached) → score against mood/time/taste → hydrate
   the top candidates and filter to titles actually streamable on the household's providers (cached).
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

Ported from creatorgrid (the Workers-native pattern; replaces JWT bearer). Implemented as the P3
auth domain (`services/api/src/hono/routes/auth.ts`, `routes/me.ts`, `middleware/auth.ts`,
`middleware/csrf.ts`) — the Express app in `services/api/src/` is still what's actually deployed
until P3's remaining domains land and P5 cuts over:

- **Opaque session token**, stored in D1 (`sessions`), carried in an HttpOnly `session` cookie.
- **Passwords hashed with PBKDF2 via Web Crypto** — Workers has no native bcrypt.
- **Double-submit CSRF** on state-changing requests: a readable `csrfToken` cookie echoed back as an
  `x-csrf-token` header, compared with `timingSafeEqual`.
- Sensitive changes (password reset, 2FA disable, etc.) revoke other sessions.
- **TOTP 2FA**, required for admin accounts (`requireAdmin` 403s until enrolled), optional for
  everyone else — enroll/verify/disable at `POST /api/me/2fa/*`.

## Recommendation & LLM re-rank

The recommender is **heuristic**, not a heavyweight ML pipeline: taste-profile merge → TMDb
`/discover` → score → provider filter. Implemented as the P3 households/pick domain
(`services/api/src/hono/lib/recommendation.ts`, `lib/llm.ts`) — same Express-vs-Hono caveat as Auth
& CSRF above. The optional Anthropic re-rank (`claude-sonnet-4-6`, `max_tokens: 512`, 8s timeout,
prompt-cached system + taste blocks, tool-use for structured output) is premium-gated
(`recommendation.llm_rerank` plus a per-household entitlement check) and **is wired into the
recommender** in the Hono port: eligible households hydrate the top 10 scored candidates instead of
3 and pass them to `maybeRerank`, which validates the model's chosen id against what was actually
sent and falls back to the pure-ML top-1 pick on any failure (flag off, not premium, API error,
timeout). The Express `llm.service` remains unwired dead code, retired at cutover.

## Providers & regions

TMDb `/watch/providers` responses are cached into `content.providers` (region-keyed) with a staleness
check, refreshed by cron. Region is UK-first; detected at the edge from the request, overridable by
premium multi-region. Provider badges deep-link into Netflix / Prime / Disney+ with affiliate params.

## Entitlements & quota

`free` = 3 picks/day, GB region-lock; `premium` = unlimited picks, multi-region, LLM re-rank.
Implemented as Hono middleware over D1 (`pick_usage` is the daily counter; `subscriptions` is the
tier source of truth). Premium requires `tier = 'premium' AND status = 'active' AND
current_period_end > now`.

## Billing

Deferred. When enabled, port creatorgrid's test-mode Stripe pattern (`lib/stripe.ts` +
`routes/billing.ts`, "unconfigured is a valid state" — endpoints 501 until a key is set, webhook is
HMAC-verified). Until then the mock checkout stays for demos only.

## Background work (cron)

A Workers **cron trigger** runs provider-cache refresh and taste-profile recompute. Processing is
inline to start (no Cloudflare Queues, which need the Workers Paid plan); move to a queue only when
volume justifies the plan, exactly as creatorgrid defers it.

## Deploying

One Worker (`services/api`) + two Pages apps, all via `wrangler`. D1 migrations apply with
`wrangler d1 migrations apply`. First-time deploy, new versions, and rollbacks follow the
`dev-setup.md` runbook. No Docker or nginx in the app path.
