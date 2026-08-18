# Database schema

> **Implemented (ADR 0001).** Pairflix's database is **D1 (SQLite) via Drizzle** — the re-platform off
> Express/Sequelize/Postgres is code-complete (`docs/roadmap.md` tracks phase history). The source of
> truth is `packages/db/src/schema.ts`; this document mirrors it in prose. Provisioning a real D1
> database in a Cloudflare account (and an actual `wrangler deploy`) is the remaining step, documented
> as a known gap in `docs/dev-setup.md` — `--local` migrations against Miniflare work today. The old
> Postgres DDL is preserved in git history if you need it.

## Overview

- **Engine:** Cloudflare **D1** (SQLite), one database for all households (row-level tenancy).
- **ORM:** **Drizzle**. Tables are declared in `packages/db/src/schema.ts`; the typed client is
  `packages/db/src/client.ts`.
- **Migrations:** authored as SQL under `packages/db/migrations/`, generated with `drizzle-kit generate` and applied with `wrangler d1 migrations apply pairflix-db --local|--remote`.

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

This is a deliberate pairflix convention, kept even though creatorgrid (the sibling repo this stack
is ported from) uses `text` + SQL `current_timestamp` for its own timestamps — the two aren't required
to match column-encoding choices, only the auth/session _mechanism_ (see below).

## Identity & auth

`users` carries more than just the identity columns — `status`, `emailVerified`,
`failedLoginAttempts`/`lockedUntil`, `lastLogin`, and `preferences` are all live functionality (admin
ban/suspend, account-lockout security, the client app's theme preference) carried forward from the
prior Sequelize model, not a Postgres-only detail left behind. `totpSecret`/`totpEnabled`/
`totpBackupCodes` (migration `0001`) back TOTP 2FA — required for admin accounts (see
`services/api/src/middleware/auth.ts`'s `requireAdmin`), optional for everyone else.

```ts
export const users = sqliteTable('users', {
  id: text('user_id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(), // PBKDF2 (Web Crypto), was bcrypt
  role: text('role').$type<'user' | 'admin'>().notNull().default('user'),
  status: text('status')
    .$type<'active' | 'inactive' | 'pending' | 'suspended' | 'banned'>()
    .notNull()
    .default('active'),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: integer('locked_until', { mode: 'timestamp_ms' }),
  lastLogin: integer('last_login', { mode: 'timestamp_ms' }),
  totpSecret: text('totp_secret'), // AES-256-GCM encrypted at rest, keyed off SESSION_SECRET
  totpEnabled: integer('totp_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  totpBackupCodes: text('totp_backup_codes'), // JSON array of PBKDF2-hashed single-use codes
  preferences: text('preferences', { mode: 'json' })
    .$type<UserPreferences>()
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

`UserPreferences`: `{ theme: 'light' | 'dark', viewStyle: 'list' | 'grid', emailNotifications:
boolean, autoArchiveDays: number, favoriteGenres: string[] }`.

Session auth (ADR 0002) adds `sessions` and `authTokens`, both ported from creatorgrid's mechanism —
these replace the old `user_sessions`, `email_verifications`, and `password_resets` tables, which are
dropped rather than carried forward under their old shape:

```ts
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // opaque token == the `session` cookie value
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ip_address'), // captured at login, account-security only, never exposed over the API
  userAgent: text('user_agent'),
  deviceInfo: text('device_info'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const authTokens = sqliteTable('auth_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  purpose: text('purpose')
    .$type<'verify_email' | 'password_reset' | 'change_email'>()
    .notNull(),
  newEmail: text('new_email'), // only set for purpose: 'change_email'
  forcedByAdmin: integer('forced_by_admin', { mode: 'boolean' }), // admin-initiated password reset
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  consumedAt: integer('consumed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
```

`rateLimitHits` (migration `0001`) backs the D1-based IP rate limiter on the unauthenticated auth
routes (`register`, `forgot-password`, `resend-verification`) — one row per request, counted rather
than read individually; `key` is `<routeName>:<ip>` so each route's budget is independent:

```ts
export const rateLimitHits = sqliteTable('rate_limit_hits', {
  id: text('id').primaryKey(),
  key: text('key').notNull(), // `<routeName>:<ip>`
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
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
  table => [primaryKey({ columns: [table.householdId, table.userId] })]
);

export const householdInvites = sqliteTable('household_invites', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  invitedEmail: text('invited_email'),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }),
  acceptedBy: text('accepted_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
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

## Content

`content` does double duty as both the TMDb provider-availability cache (`providers`, refreshed by
`providers.service.ts`) _and_ the admin content-moderation registry (`status`, `reportedCount`,
`removalReason`, referenced by `contentReports`) — this is one table serving both purposes in the
current codebase, not two, so it stays one table here. `type` (movie/show/episode, moderation-facing)
and `mediaType` (movie/tv, TMDb-facing) are both real, independent columns.

```ts
export const content = sqliteTable(
  'content',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    type: text('type').$type<'movie' | 'show' | 'episode'>().notNull(),
    status: text('status')
      .$type<'active' | 'pending' | 'flagged' | 'removed'>()
      .notNull()
      .default('pending'),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: text('media_type').$type<'movie' | 'tv'>(),
    year: integer('year'),
    posterPath: text('poster_path'),
    reportedCount: integer('reported_count').notNull().default(0),
    removalReason: text('removal_reason'),
    providers: text('providers', { mode: 'json' })
      .$type<ContentProviders>()
      .notNull()
      .default({}),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [
    index('idx_content_tmdb').on(table.tmdbId),
    uniqueIndex('idx_content_tmdb_media_type').on(
      table.tmdbId,
      table.mediaType
    ),
  ]
);

export const contentReports = sqliteTable('content_reports', {
  id: text('id').primaryKey(),
  contentId: text('content_id')
    .notNull()
    .references(() => content.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status')
    .$type<'pending' | 'dismissed' | 'resolved'>()
    .notNull()
    .default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

`ContentProviders` is region-keyed, e.g. `{ GB: { flatrate: [{ provider_id, provider_name, logo_path
}], free: [], ads: [], rent: [], buy: [], link: <url> }, last_updated_at: <iso> }` -- `free`/`ads`/
`link` (P3 providers/history) were added so `lib/providerLaunch.ts` can read a title's deep-link
straight from this cache instead of a third, disconnected TMDb fetch path.

`idx_content_tmdb_media_type` is a **unique** index (P3 providers/history,
`0002_content_provider_unique_index.sql`) -- the provider-cache read-through path always supplies a
concrete `mediaType`, so `(tmdbId, mediaType)` is a real upsert target (`onConflictDoUpdate`)
instead of a plain find-then-create, closing a duplicate-row race under concurrent cache misses for
the same title. It also gives `lib/history.ts`'s join something correct to match on -- joining on
`tmdbId` alone (a movie and a TV show can share a numeric TMDb id) risked attaching the wrong
title/poster to a watched-together row.

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

## Admin: audit log & settings

```ts
export const auditLogs = sqliteTable('audit_logs', {
  id: text('log_id').primaryKey(),
  level: text('level').$type<'info' | 'warn' | 'error' | 'debug'>().notNull(),
  message: text('message').notNull(),
  context: text('context', { mode: 'json' }).$type<Record<string, unknown>>(),
  source: text('source').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
  category: text('category').notNull().default('general'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

`auditLogs` is general leveled application logging (ops/debugging, the admin audit-log viewer) —
distinct from creatorgrid's own `auditLog` table, which specifically records admin moderation actions
(suspend/unsuspend/etc). Pairflix's current `AuditLog` Sequelize model is the leveled-log shape, so
that's what carries forward here.

`settings` replaces `app_settings` — a small key/value table for feature flags and runtime config that
needs to change without a redeploy (vs. a Worker var, which needs one).

## Dropped in the re-platform

Pairflix is pre-launch alpha with **no production data**, so the old matching schema is **not** carried
into D1 — nothing to preserve or backfill. Dropped: `matches`, `watchlist_entries`, `tags`,
`entry_tags`, `activity_log`. Superseded rather than carried forward under their old shape:
`user_sessions` → `sessions`, `email_verifications` + `password_resets` → `authTokens`, `app_settings`
→ `settings`.

**Taste input (decided 2026-08-16):** `taste_profiles` is seeded from a light **onboarding** step
(genre/mood picks + a few love-it/not-for-me swipes + the household's services) and refined from
`watched_together` thumbs. The personal watchlist is **not** a taste input, so `watchlist_entries` is
dropped with the rest of the legacy schema. A lightweight "save for tonight" list may return later as a
convenience, but the recommender won't depend on it.

## Migrations

```bash
pnpm --filter @pairflix/db db:generate                        # drizzle-kit generate -> packages/db/migrations/*.sql
pnpm --filter @pairflix/api db:migrate:local                  # wrangler d1 migrations apply pairflix-db --local (dev, Miniflare)
pnpm --filter @pairflix/api db:migrate:remote                 # wrangler d1 migrations apply pairflix-db --remote (production)
```

Never edit a shipped migration — add a new one. `0000_init.sql` is the initial schema, authored fresh
rather than translated 1:1 from the four Sequelize migrations (`phase-a-households`,
`subscriptions-and-pick-usage`, `household-invites`, `pick-events`) — those defined the Postgres shape
these tables ported from, but D1's own migration history starts clean. `0001_totp_and_rate_limits.sql`
(P3 auth domain) adds the TOTP columns on `users` and the `rateLimitHits` table above.
`0002_content_provider_unique_index.sql` (P3 providers/history domain) adds the unique
`(tmdbId, mediaType)` index on `content` described above -- `ProviderRegion`'s widened shape is a
JSON-column type change only, no migration needed for it.

`services/api/wrangler.jsonc`'s `d1_databases[].database_id` is a placeholder until a real D1 database
is provisioned in a Cloudflare account (`wrangler d1 create pairflix-db`) — `--remote` won't work until
then, but `--local` (Miniflare, fully offline) doesn't need it to be real.
