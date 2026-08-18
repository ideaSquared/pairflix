# Roadmap

> Replaces the retired `phase4-roadmap.md` (a "social entertainment platform" plan for the old
> product). This roadmap reflects the household product and the Cloudflare re-platform (ADR 0001).
> Status: **pre-launch alpha, no public users.**

## Where the code actually is

**Built and wired** (product pivot scaffolds A–E, merged):

- Household model + membership/ownership, invites, create/accept flow.
- `POST /api/households/:id/pick` — heuristic recommender (taste merge → TMDb `/discover` → score →
  provider filter) behind region-lock + daily-quota middleware.
- Providers fetch + cache; provider deep-links; watch-together history with thumbs.
- Freemium entitlements (free = 3 picks/day + GB lock; premium = unlimited + multi-region).
- Frontends: Tonight picker, History, Households, mock Billing.

**Built but not delivering value yet** (fix as part of the re-platform, not before):

- **LLM re-rank was dead code on Express** — `llm.service` / `maybeRerank` was fully implemented and
  unit-tested but never called by the recommender. Wired in as part of the Hono households/pick port
  (`services/api/src/hono/lib/llm.ts`, `lib/recommendation.ts`); the Express version is still
  unwired, retired at cutover along with the rest of that tree.
- **Two server entry points** (`index.ts` runtime vs orphaned `app.ts`) mount different routes; at
  runtime the **email flows are unreachable** and the user prefix differs. The Hono port collapses
  this to one app and fixes it.
- **Recommender is movie-only** and runtime-blind (neutral runtime score) despite `movie | tv`
  plumbing.
- **Billing is mock-only** (no Stripe).
- **Thin tests on the pivot** — no integration tests for any pivot endpoint; several pivot services
  untested.

## Re-platform to Cloudflare (ADR 0001)

Staged so the app keeps running through each step. Each phase is a PR with its docs updated.

### P1 — Restructure — done

Moved to pnpm + Turborepo + `apps/*` + `services/*` + `packages/*`; lifted shared eslint/tsconfig/husky
config from creatorgrid. Also folded in the styled-components → vanilla-extract migration (#63, #64) —
not originally scoped to P1, but landed together once decided mid-restructure. `services/api` still
runs on the current Node/Express runtime; the re-platform to Hono is P3.

### P2 — Data layer — done

Authored the household schema fresh in `packages/db` (Drizzle + D1) — see `db-schema.md` for the full
table list. No data migration — alpha. Dropped the legacy tables the product doesn't use, including
`watchlist_entries` (taste now comes from onboarding + thumbs). `services/api/wrangler.jsonc` has just
the `d1_databases` binding needed for migrations tooling so far — `main`/routes/vars land in P3 when
this becomes an actual Hono Worker. `database_id` is a placeholder until a real D1 database is
provisioned.
**Exit:** `wrangler d1 migrations apply --local` builds the schema (verified); Drizzle client typed
(verified — `pnpm --filter @pairflix/db type-check` is clean).

### P3 — API — in progress

Port route modules to a Hono Worker one domain at a time: **auth** (session cookie + PBKDF2 + CSRF, ADR 0002) →
**households/pick** (wire in the LLM re-rank here) → **providers/history** → **billing/admin**.
Collapse the two server entries into one; make email flows reachable.

**auth — done.** `services/api/src/hono/` (routes/middleware/lib) alongside the still-deployed
Express tree, not yet cut over — kept in a separate subdirectory with its own `tsconfig.hono.json`
and a `vitest.config.mts` (`@cloudflare/vitest-pool-workers` against local D1) so the two frameworks'
incompatible tooling (module system, test runner) don't collide; `pnpm --filter @pairflix/api test`
runs both suites. Session cookie + PBKDF2 + double-submit CSRF per ADR 0002, plus **TOTP 2FA**
(`totp_secret`/`totp_enabled`/`totp_backup_codes` on `users`, `packages/db/migrations/0001`),
required for admin accounts (`requireAdmin`) — creatorgrid's auth ported and adapted for pairflix's
schema (`username` field, `status` enum instead of a separate suspended flag, no creator sub-entity,
Resend over nodemailer since Workers can't do SMTP). `packages/lib.validation` holds the shared Zod
request schemas. 30 passing `vitest-pool-workers` tests cover register/login/lockout/suspend/ban/
verify-email/forgot-password/reset-password/bootstrap-admin/2FA/IP rate limiting.

**households/pick — done.** `services/api/src/hono/lib/{household,entitlements,featureFlags,
tasteSummary,llm,pickEvents,recommendation}.ts`, `middleware/{household,entitlements}.ts`,
`routes/households.ts`. Household CRUD/membership/invites — including accept-invite, which existed
in Express (`householdInvites.routes.ts`) but was never mounted on the app router, so invites could
be created but never accepted — plus `POST /:id/pick` and `POST /:id/picks/:tmdbId/commit`, both
gated by a consolidated `isMember`/`isOwner` check instead of the several separate reimplementations
in Express. The LLM re-rank is now wired in for real: eligible households (flag on + premium)
hydrate the top 10 scored candidates instead of 3 and pass them to `maybeRerank`, which validates
the model's pick against what was actually sent and falls back to the pure-ML top-1 on any failure.
Also fixes two bugs found while porting: `commit` now records a `pick_events` "accepted" row
(Express only ever wrote "proposed", silently breaking the first-pick-acceptance-rate KPI), and the
pick route now checks household membership at all (Express's controller didn't, though its quota
middleware happened to). `getFinishedTmdbIdsForMembers` (keyed off the deleted `WatchlistEntry`
table) is dropped rather than ported — the household-level `watchedTogether` exclusion set already
covers what the pivoted product needs.
**Known gap, not fixed here:** nothing computes `taste_profiles` rows going forward — Express's only
writer (`tasteProfile.service.ts`) is itself entirely built on `WatchlistEntry`. The recommender
degrades gracefully to mood-only genre filtering when a household has no profiles yet (the common
case pre-launch); deriving weights from `watchedTogether` instead is a real product decision (what
signal, what decay) left for a follow-up rather than decided inline here.
15 new `vitest-pool-workers` tests cover CRUD/invites, pick quota/region-lock/provider-filter,
commit, and the LLM wiring (including the Anthropic-failure fallback) — the pick path returns a
title end-to-end on Miniflare, meeting this phase's exit criterion for this domain.

**providers/history — done.** `services/api/src/hono/lib/{providers,providerLaunch,history,
pickEventStats}.ts`, `routes/providers.ts` (new, standalone `GET /api/providers/:tmdbId`),
`routes/households.ts` extended with `/:id/history` (GET + PATCH), `/:id/picks/:tmdbId/launch`,
`/:id/pick-events`, `/:id/pick-events/stats`. The headline change: Express had three disconnected
paths independently fetching TMDb watch-provider data (a `content`-table cache only the standalone
endpoint used, an in-process cache only the recommender used and already dropped in the households/
pick port, and provider-launch's own uncached raw fetch) — now there's one D1-backed read-through
cache (`lib/providers.ts`) all of them share, widened to carry `free`/`ads`/`link` (Express's
stored shape dropped all three, which is why provider-launch never read from it).

Fixes two more bugs found while porting: a duplicate-row race in the provider cache under
concurrent misses for the same title (new unique `(tmdbId, mediaType)` index, migration `0002`),
and a `tmdbId`-only history join that could attach the wrong title/poster to a watched-together row
when a movie and a TV show share a numeric TMDb id (now joins on both columns). History's list/PATCH
responses are also unified to the same shape (Express's PATCH returned a bare row while its GET
returned a joined one), `PATCH .../history/:watchedId` now accepts `enjoyed: null` to un-rate
(Express's validator rejected it even though the column is nullable), and history pagination follows
CLAUDE.md's house `{ data, pagination }` shape rather than Express's flat capped-at-200 list. The
generic `POST /:id/pick-events` endpoint's `kind` is narrowed to `swapped`/`dismissed` only --
`proposed`/`accepted` are already auto-recorded by the pick and commit routes, and
`provider_launched` is only recordable through the TMDb-verified launch endpoint.

**Known gaps, not fixed here:**

- `content` rows created by the provider-cache write path get a placeholder title
  (`"Untitled movie"`/`"Untitled show"`) — the caching path never fetches real title/poster data,
  matching Express exactly (a pre-existing gap, not a regression). History entries' `providers`
  field is real; `title`/`year`/`posterPath` read as the placeholder until something enriches
  `content` with real metadata -- the natural place is `lib/recommendation.ts`'s hydration step,
  which already fetches real title/runtime per candidate but doesn't write it back to `content`.
  Deliberately not bundled into this change; a small, low-risk follow-up.
- The standalone `GET /api/providers/:tmdbId` has no household context, so it can't apply the
  free-tier GB region-lock the way `/:id/pick`, `/:id/history`, and `/:id/picks/:tmdbId/launch` now
  all do -- a free-tier caller can request any region directly through this one endpoint. Closing it
  needs a product decision (which household's entitlement applies, for a caller in more than one)
  rather than a silent pick.
- No cron-driven provider-cache refresh -- caching is lazy/on-demand only (matches Express; the
  cron trigger `docs/architecture.md` describes was already aspirational, not a ported behavior).

21 new `vitest-pool-workers` tests (provider caching including the movie/tv collision case and a
TMDb-failure degrade, history list/pagination/thumbs, provider-launch including its recorded
`pick_events` row, the generic pick-events endpoint's kind restriction, and stats aggregation).

**billing/admin — done.** The last P3 domain. `services/api/src/hono/lib/{adminUsers,adminContent,
adminAuditLogs,adminSettings,adminDashboard,billing}.ts`, `routes/admin.ts` (new, mounted at
`/api/admin` behind `requireAdmin`), `routes/households.ts` extended with `/:id/entitlements` and
`/:id/billing/{checkout,cancel,mock-activate}` (household-scoped and owner-gated, replacing
Express's flat `/api/billing/*` + body `household_id` shape). No new migration -- every table this
domain touches (`content`, `content_reports`, `audit_logs`, `settings`, `subscriptions`, `sessions`)
already had the columns it needed, several with doc comments in `packages/db/src/schema.ts` already
anticipating this port.

Most of Express's admin surface ports faithfully: user management, audit logs, content moderation.
Two things don't:

- The separate admin JWT login/validate-token/refresh/logout endpoints are dropped entirely --
  confirmed structurally identical to regular auth (same `JWT_SECRET`, same `authenticateToken`),
  fully subsumed by the session-cookie + `requireAdmin` (role + TOTP) gate every other admin route
  already uses.
- 8 of Express's 12 stats/activity endpoints are dropped -- backed by the `activity_log` table the
  re-platform drops, or Postgres/Node-process introspection (`pg_stat_activity`, `os.*`,
  `process.memoryUsage()`) with no D1/Workers-isolate equivalent at all; several of those numbers
  are already hardcoded random fallbacks in Express, not real telemetry. Replaced with one new
  `GET /api/admin/dashboard-stats` built from tables that still exist post-pivot (users, households,
  subscriptions, audit-log errors) rather than porting dead or unportable code.

Also fixes several bugs found while porting: the two competing Express status-change endpoints
(`status`/`status-enhanced`, with materially different side effects) are consolidated into one that
always does the fuller behavior; `listUsers`/`listContent`'s `sortBy` is whitelisted instead of
splicing the query string into the ORM's order clause; `getLockedAccounts` uses the real login
lockout threshold (`FAILED_ATTEMPT_LIMIT`, now shared from `lib/session.ts`) instead of Express's
drifted hardcoded `3`; `forcePasswordReset` only moves a user to `pending` from `active`/`inactive`,
not unconditionally (Express's version would silently un-suspend/un-ban an account); dismissing a
content report only decrements `reportedCount` once, not on every repeat dismissal; and an
admin-supplied status-change `reason` is HTML-escaped before it reaches an email body (a real
Copilot review finding on this PR). Terminating a user's session is also now genuinely enforced --
a Hono `sessions` row is the live credential `sessionMiddleware` checks on every request, unlike
Express's `user_sessions` rows, which were never consulted by its own auth middleware.

**Known gap, not fixed here:** the automatic daily audit-log retention sweep (Express: a
`node-cron` job) isn't ported -- a stateless Worker has no equivalent always-running process for it.
`POST /api/admin/audit-logs/rotation` covers the manual/on-demand half; the automatic half needs a
Cloudflare Cron Trigger, same "not implemented yet" status as the provider-cache refresh cron noted
below.

22 new `vitest-pool-workers` tests (`admin.e2e.test.ts`, new, plus `households.e2e.test.ts`
extended) covering the auth gate, each of the behavior fixes above, and the billing/entitlements
roundtrip (mock-activate flips a household to premium, cancel reverts it).

**Pending:** collapse the two server entries into one and cut over (P5).
**Exit:** each domain has `vitest-pool-workers` integration tests against local D1; the pick path
returns a title end-to-end on Miniflare.

### P4 — Frontends — done

Move `app.client` / `app.admin` to `apps/*` on Pages; `lib.components` to `packages/`. Switch API
clients from JWT to the cookie/CSRF flow.
**Exit:** both SPAs run on `wrangler pages dev` against the local Worker.

**apps/client (P4a) — done.** Auth foundation rewritten onto the session-cookie + double-submit
CSRF flow (`apps/client/src/services/api/utils.ts`'s `fetchWithAuth`, no more `localStorage`
token) with a Vite dev-server proxy (`/api` -> the Worker at `:8787`) so local dev stays
same-origin, which the `SameSite=Lax` session cookie requires. Every service client (`households`, `history`, `billing`,
`user`, `email`, `auth`) rewritten to match the Hono routes' actual request/response shapes, and
those fixes propagated through the consumers (Tonight, History, Profile, forgot/reset-password,
email verification). Removed the pre-pivot dead weight -- `activity`/`match`/`watchlist` features
and their routes/nav, the decorative admin-settings fetch in `SettingsContext`, `admin.ts`,
`mediaUpload.ts`, a duplicate `emailService.ts`. Added `apps/client/wrangler.jsonc`
(`pages_build_output_dir`) and a `public/_redirects` SPA fallback. Verified end to end in a real
browser against a local Worker + D1 (register -> verify-email -> login -> create a household ->
Tonight -> history -> profile updates -> logout -> re-login), which caught and fixed two real bugs
along the way: `usePrimaryHousehold` was still the pre-Phase-A localStorage stub (History
permanently read "not in a household"), and `LogoutRoute`'s effect could fire `/api/auth/logout`
more than once concurrently, occasionally 403'ing on a CSRF-cookie race between the duplicate
calls.
**apps/admin (P4b) — done.** Same auth-foundation rewrite as P4a, plus admin-specific TOTP: login
surfaces the `TOTP code required` case with a code field, and a new `/setup-2fa` page (enrol ->
verify -> one-time backup codes) since `requireAdmin` (`services/api/src/hono/middleware/auth.ts`)
gates every `/api/admin/*` route on `totpEnabled`, not just `role`. Removed the dead-weight that
had no Workers/D1 equivalent -- System Monitoring and System Stats (no `os`/`process`
introspection on a Workers isolate), the pre-pivot Activity feed and `enableMatching`/
`enableActivityFeed` settings -- and rewrote `admin.ts` from the real Hono routes: `/api/admin/*`
responses are unwrapped (no `{data: ...}` envelope, unlike `/api/auth`, `/api/me`,
`/api/households`), and pagination is page-based (`{data, pagination: {page, limit, total,
totalPages}}`). Settings collapsed from a fictional 6-tab form (SMTP, storage provider, password
policy -- none backed by the real free-form `SettingsTree`) to the one real flag
(`recommendation.llm_rerank`) plus the existing JSON import/export for anything else. Added
`apps/admin/wrangler.jsonc` and `public/_redirects`, matching P4a. Verified end to end in a real
browser (register -> promote to admin -> login -> 2FA setup -> dashboard -> create a user ->
content moderation -> audit logs -> settings -> logout), which caught and fixed three real bugs:
`TwoFactorSetupPage` called `checkAuth()` right after showing the backup codes, and the resulting
auth-cache refresh raced the reveal screen off-navigation before the admin could read them (now
the cache is patched synchronously on the "Continue" click instead); the same page's enrol
`useEffect` had no StrictMode guard, so a double-invoke re-enrolled and silently invalidated the
secret an authenticator app had already scanned; and `Pagination`'s `active` page-indicator prop
leaked onto the DOM (`Received true for a non-boolean attribute` on the current page's button)
without ever driving its variant, so the current page had no visual indicator besides
`aria-current` -- fixed in `packages/lib.components`, so it benefits any consumer.

### P5 — Cutover

Point dev + deploy at wrangler; retire Docker/nginx from the app path; delete the old `backend/`
Express tree.
**Exit:** production deploys via `wrangler deploy` + Pages; the old stack is gone.

## Product work to reach closed alpha

Independent of the platform, needed before opening to an invited cohort:

- Wire the LLM re-rank and validate it improves first-pick acceptance (premium only).
- Extend the recommender to TV, and make runtime actually influence scoring.
- Feed `ProviderBadges` real provider data on the Tonight card and history.
- Integration tests for the pick / providers / entitlements paths.
- Build the **onboarding taste-starter** (genre/mood picks + a few love-it/not-for-me swipes + service
  selection) to seed `taste_profiles` and solve cold-start — the decided taste model is onboarding +
  watched-together thumbs, no watchlist.
- Real Stripe (gated on go-live sign-off) — until then premium is comp/mock only.

**Alpha exit criteria:** a real household can create an account, get a genuinely good first pick in
under 30s across their providers, launch it, and have it remembered — reliably, on the deployed
Cloudflare stack.

## Retired

The old `phase4-roadmap.md` vision — social feeds, watch parties, discussion groups, real-time
messaging, React Native, a microservices/Kafka/Elasticsearch platform — is **not** the plan. It was
written for the pre-pivot product. Do not build from it.
