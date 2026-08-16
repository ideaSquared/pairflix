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

- **LLM re-rank is dead code** — `llm.service` / `maybeRerank` is fully implemented and unit-tested
  but never called by the recommender. Wire it in during the API port.
- **Two server entry points** (`index.ts` runtime vs orphaned `app.ts`) mount different routes; at
  runtime the **email flows are unreachable** and the user prefix differs. The Hono port collapses
  this to one app and fixes it.
- **`ProviderBadges` is fed an empty array** on the history page — placeholder wiring.
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

**Pending:** households/pick, providers/history, billing/admin domains; then collapse the two server
entries into one and cut over.
**Exit:** each domain has `vitest-pool-workers` integration tests against local D1; the pick path
returns a title end-to-end on Miniflare.

### P4 — Frontends

Move `app.client` / `app.admin` to `apps/*` on Pages; `lib.components` to `packages/`. Switch API
clients from JWT to the cookie/CSRF flow.
**Exit:** both SPAs run on `wrangler pages dev` against the local Worker.

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
