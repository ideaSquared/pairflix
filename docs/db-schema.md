# Database schema

> **Target state (ADR 0001).** Pairflix's database is moving from Postgres (Sequelize) to **D1
> (SQLite) via Drizzle**. This document describes the target schema; once the data-layer phase (P2)
> lands, the source of truth will be `packages/db/src/schema.ts`. The `docs/roadmap.md` data-layer
> phase tracks the migration. The old
> Postgres DDL is preserved in git history if you need it.

## Overview

- **Engine:** Cloudflare **D1** (SQLite), one database for all households (row-level tenancy).
- **ORM:** **Drizzle**. Tables are declared in `packages/db/src/schema.ts`; the typed client is
  `packages/db/src/client.ts`.
- **Migrations:** authored as SQL under `packages/db/migrations/`, generated with `drizzle-kit
generate` and applied with `wrangler d1 migrations apply pairflix-db --local|--remote`.

## Type conventions (Postgres → SQLite/Drizzle)

SQLite has a narrow type system; the Postgres schema maps as follows:

| Postgres           | Drizzle / D1                               | Notes                               |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| `UUID` PK          | `text('id').primaryKey()`                  | app generates `crypto.randomUUID()` |
| `TIMESTAMPTZ`      | `integer('...', { mode: 'timestamp_ms' })` | stored as epoch millis              |
| `JSONB`            | `text('...', { mode: 'json' }).$type<T>()` | serialized JSON                     |
| `BOOLEAN`          | `integer('...', { mode: 'boolean' })`      | 0 / 1                               |
| enum               | `text('...').$type<'a' \| 'b'>()`          | + a `CHECK` in the migration        |
| `INTEGER` / `TEXT` | `integer(...)` / `text(...)`               | unchanged                           |

`ON DELETE CASCADE` / `SET NULL` are expressed with Drizzle `references(() => t.col, { onDelete })`
and are enforced by D1 (SQLite foreign keys are on).

## Identity & auth

`users` keeps its columns; the password hash is now **PBKDF2** (was bcrypt). Session auth adds two
tables ported from creatorgrid.

```ts
export const users = sqliteTable('users', {
  id: text('user_id').primaryKey(), // UUID string
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(), // PBKDF2 (Web Crypto)
  role: text('role').$type<'user' | 'admin'>().notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // opaque token == cookie value
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
});

export const authTokens = sqliteTable('auth_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').$type<'verify_email' | 'password_reset'>().notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  consumedAt: integer('consumed_at', { mode: 'timestamp_ms' }),
});
```

## Households

```ts
export const households = sqliteTable('households', {
  id: text('id').primaryKey(),
  name: text('name'), // nullable
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const householdMembers = sqliteTable(
  'household_members',
  {
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').$type<'owner' | 'member'>().notNull().default('member'),
    joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).notNull(),
  },
  t => ({ pk: primaryKey({ columns: [t.householdId, t.userId] }) })
);

export const householdInvites = sqliteTable('household_invites', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  invitedEmail: text('invited_email'),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }),
  acceptedBy: text('accepted_by').references(() => users.id, {
    onDelete: 'set null',
  }),
});
```

Ownership is `household_members.role = 'owner'` — there is no `owner_id` column.

## Taste & history

```ts
export const tasteProfiles = sqliteTable('taste_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  weights: text('weights', { mode: 'json' }).$type<TasteWeights>().notNull(),
  embedding: text('embedding', { mode: 'json' }).$type<number[]>(), // reserved
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const watchedTogether = sqliteTable(
  'watched_together',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: text('media_type').$type<'movie' | 'tv'>().notNull(),
    watchedAt: integer('watched_at', { mode: 'timestamp_ms' }).notNull(),
    enjoyed: integer('enjoyed', { mode: 'boolean' }), // thumbs, nullable
    moodAtPick: text('mood_at_pick'),
    minutesBudgetAtPick: integer('minutes_budget_at_pick'),
  },
  t => ({
    byRecency: index('idx_wt_household_watched_at').on(
      t.householdId,
      t.watchedAt
    ),
    byTitle: index('idx_wt_household_tmdb').on(t.householdId, t.tmdbId),
  })
);
```

`TasteWeights` shape (unchanged): `{ genres: Record<string, number>, runtime_pref: number, era?:
Record<string, number>, tone?: Record<string, number> }`.

## Content (TMDb cache)

```ts
export const content = sqliteTable(
  'content',
  {
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: text('media_type').$type<'movie' | 'tv'>().notNull(),
    title: text('title'),
    year: integer('year'),
    posterPath: text('poster_path'),
    providers: text('providers', { mode: 'json' })
      .$type<ProviderMap>()
      .notNull()
      .default('{}'),
    // ...existing metadata columns...
  },
  t => ({ pk: primaryKey({ columns: [t.tmdbId, t.mediaType] }) })
);
```

`ProviderMap` is region-keyed, e.g. `{ GB: { flatrate: [{ provider_id, provider_name, logo_path }],
rent: [], buy: [] }, last_updated_at: <iso> }`.

## Freemium

```ts
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .unique()
    .references(() => households.id, { onDelete: 'cascade' }),
  tier: text('tier').$type<'free' | 'premium'>().notNull().default('free'),
  status: text('status')
    .$type<'active' | 'past_due' | 'canceled'>()
    .notNull()
    .default('active'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const pickUsage = sqliteTable(
  'pick_usage',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    pickedAt: integer('picked_at', { mode: 'timestamp_ms' }).notNull(),
  },
  t => ({
    byDay: index('idx_pick_usage_household_picked_at').on(
      t.householdId,
      t.pickedAt
    ),
  })
);
```

Premium is `tier = 'premium' AND status = 'active' AND current_period_end > now`. `stripe_*` stay
null until real Stripe is wired.

## Analytics

```ts
export const pickEvents = sqliteTable(
  'pick_events',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: text('media_type').$type<'movie' | 'tv'>().notNull(),
    kind: text('kind')
      .$type<
        'proposed' | 'accepted' | 'swapped' | 'dismissed' | 'provider_launched'
      >()
      .notNull(),
    mood: text('mood'),
    minutesBudget: integer('minutes_budget'),
    providerSlug: text('provider_slug'), // non-null only for provider_launched
    region: text('region'), // 2-letter
    occurredAt: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
  },
  t => ({
    byRecency: index('idx_pe_household_occurred_at').on(
      t.householdId,
      t.occurredAt
    ),
    byKind: index('idx_pe_household_kind').on(t.householdId, t.kind),
  })
);
```

Backs the first-pick acceptance-rate KPI and affiliate attribution.

## Dropped in the re-platform

Pairflix is pre-launch alpha with **no production data**, so the old matching schema is **not** carried
into D1 — nothing to preserve or backfill. Dropped: `matches`, `watchlist_entries`, `tags`,
`entry_tags`, `activity_log`. Feature flags move to a small `settings` table (or Worker vars) in place
of `app_settings`.

**Taste input (decided 2026-08-16):** `taste_profiles` is seeded from a light **onboarding** step
(genre/mood picks + a few love-it/not-for-me swipes + the household's services) and refined from
`watched_together` thumbs. The personal watchlist is **not** a taste input, so `watchlist_entries` is
dropped with the rest of the legacy schema. A lightweight "save for tonight" list may return later as a
convenience, but the recommender won't depend on it.

## Migrations

```bash
pnpm --filter @pairflix/db db:generate         # drizzle-kit generate -> packages/db/migrations/*.sql
wrangler d1 migrations apply pairflix-db --local   # dev (Miniflare)
wrangler d1 migrations apply pairflix-db --remote  # production
```

Never edit a shipped migration — add a new one. The four Sequelize migrations
(`phase-a-households`, `subscriptions-and-pick-usage`, `household-invites`, `pick-events`) are
translated into the initial SQL migration set during the data-layer phase.
