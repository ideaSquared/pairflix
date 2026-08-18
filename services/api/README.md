# Pairflix API

A single [Hono](https://hono.dev) Worker, deployed to Cloudflare Workers, serving the Pairflix
household "what should we watch tonight" product.

## Stack

- **Framework**: Hono, running on the Workers runtime (not Node)
- **Database**: [Drizzle ORM](https://orm.drizzle.team) on Cloudflare D1 (SQLite) — schema and
  migrations live in `packages/db`
- **Auth**: opaque session cookie stored in D1, PBKDF2 password hashing via Web Crypto, double-submit
  CSRF, optional/admin-required TOTP 2FA
- **External APIs**: TMDb (titles, providers), Anthropic (premium LLM re-rank), Resend (email) — all
  called over `fetch`, no SDKs
- **Tests**: Vitest via `@cloudflare/vitest-pool-workers`, running real Hono requests against a local
  Miniflare D1

See `docs/architecture.md` (repo root) for the full system design and `docs/db-schema.md` for the
data model. This file is just orientation for working in this workspace.

## Project structure

```
services/api/
├── src/
│   ├── routes/       # Hono route modules — wire middleware + call into lib, no business logic
│   │   ├── auth.ts        # register/login/logout/verify-email/forgot+reset-password
│   │   ├── me.ts           # current user, profile updates, 2FA enroll/verify/disable
│   │   ├── households.ts   # CRUD/membership/invites, pick/commit, history, billing, entitlements
│   │   ├── providers.ts    # standalone provider lookup
│   │   ├── admin.ts        # mounted at /api/admin behind requireAdmin
│   │   └── health.ts
│   ├── middleware/    # auth (session), csrf, household membership, entitlements, IP rate limiting
│   ├── lib/            # business logic: recommendation, llm, providers, billing, admin*, etc.
│   ├── test/            # vitest-pool-workers setup (migrations, auth helpers)
│   ├── types.ts        # Worker Env bindings
│   └── index.ts         # Hono app entry point (wrangler.jsonc's `main`)
├── package.json
├── tsconfig.json
├── vitest.config.mts
└── wrangler.jsonc
```

## Local development

```bash
cp .dev.vars.example .dev.vars     # local Worker secrets (see the file for what each does)
pnpm --filter @pairflix/db db:migrate:local
pnpm dev                            # wrangler dev, http://localhost:8787
```

Missing optional keys (`TMDB_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`) degrade gracefully
rather than failing — see `.dev.vars.example`'s comments. Full setup: `docs/dev-setup.md`.

## Scripts

```bash
pnpm dev                # wrangler dev
pnpm deploy              # wrangler deploy
pnpm test                # vitest run (real Hono requests against local D1)
pnpm type-check          # tsc --noEmit
pnpm lint                # eslint src/
pnpm db:migrate:local     # wrangler d1 migrations apply pairflix-db --local
pnpm db:migrate:remote    # wrangler d1 migrations apply pairflix-db --remote
```

## Auth model

Session-cookie based, not JWT: `POST /api/auth/login` sets an HttpOnly `session` cookie backed by a
D1 row. State-changing requests also need a `x-csrf-token` header matching the readable `csrfToken`
cookie (double-submit). Admin accounts additionally require TOTP 2FA — `requireAdmin` 403s any
`/api/admin/*` request until `POST /api/me/2fa/verify` has been completed once. See `docs/db-schema.md`
for the `sessions`/`auth_tokens`/`users` columns this relies on.

## Security

See `docs/SECURITY.md`.
