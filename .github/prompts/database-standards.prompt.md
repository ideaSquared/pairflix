---
mode: 'agent'
description: 'Database standards for Drizzle ORM on Cloudflare D1 (SQLite)'
applyTo: 'packages/db/**/*.ts,services/api/src/lib/**/*.ts'
---

# Database Requirements (Drizzle ORM on Cloudflare D1 / SQLite)

- Schema lives in `packages/db/src/schema.ts`; the typed client is `packages/db`'s exports. The DB
  handle comes from the Worker's `Env.DB` binding, passed down -- never a module-level singleton.
- JSON columns use `text({ mode: 'json' }).$type<T>()`; timestamps use
  `integer({ mode: 'timestamp_ms' })`; booleans use `integer({ mode: 'boolean' })` -- D1/SQLite has no
  native JSON, timestamp, or boolean column types.
- Index every column you'll filter or join on.
- One schema change = one migration, generated with `drizzle-kit generate`
  (`pnpm --filter @pairflix/db db:generate`), applied with
  `wrangler d1 migrations apply pairflix-db --local|--remote`. SQL migration files land under
  `packages/db/migrations/`.
- **Never modify a shipped migration.** Create a new one.
- Document every new table/column in `docs/db-schema.md` in the same PR.
- Prefer explicit foreign keys and `NOT NULL`/`UNIQUE`/`CHECK` constraints where D1/SQLite supports
  them; D1 has no `GENERATED ALWAYS AS (...) STORED` columns or JSONB, unlike Postgres.
- No transactions across D1 batches beyond what `db.batch()` provides -- D1 doesn't support
  multi-statement interactive transactions the way Postgres does. Keep multi-step writes to what a
  single `db.batch()` call can express, or accept the non-atomicity and document why.
- Validate request/response shapes with the shared schemas in `packages/lib.validation`, not
  hand-rolled per-endpoint checks.
- Test against a real local D1 (Miniflare, via `@cloudflare/vitest-pool-workers`) -- see
  `docs/dev-setup.md`. Don't mock the DB layer; use the local D1 as the Postgres/pg-mem equivalent.
