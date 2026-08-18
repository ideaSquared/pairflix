import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// Timestamps are `integer(..., { mode: 'timestamp_ms' })` (epoch millis, app-generated via
// `Date.now()`) rather than creatorgrid's `text(...)` + SQL `current_timestamp` -- this was the
// explicit, already-documented convention in docs/db-schema.md before this schema was written, kept
// as-is rather than silently switched to match the sibling repo.

/**
 * `status`/`emailVerified`/`failedLoginAttempts`/`lockedUntil`/`lastLogin`/`preferences` aren't in
 * the original docs/db-schema.md sketch of this table, but are all live columns on the current
 * Sequelize `User` model backing real functionality (admin ban/suspend, account lockout, the client
 * app's theme preference) -- carried forward rather than dropped.
 */
export const users = sqliteTable('users', {
  id: text('user_id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
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
  /** AES-256-GCM encrypted at rest (see services/api/src/lib/crypto.ts `encryptSecret`), keyed
   * off SESSION_SECRET. Required for admin accounts (see
   * services/api/src/middleware/auth.ts `requireAdmin`). */
  totpSecret: text('totp_secret'),
  totpEnabled: integer('totp_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  /** JSON array of PBKDF2-hashed single-use recovery codes; consumed entries are removed. */
  totpBackupCodes: text('totp_backup_codes'),
  preferences: text('preferences', { mode: 'json' })
    .$type<UserPreferences>()
    .notNull()
    .default({
      theme: 'dark',
      viewStyle: 'grid',
      emailNotifications: true,
      autoArchiveDays: 30,
      favoriteGenres: [],
    }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export type UserPreferences = {
  theme: 'light' | 'dark';
  viewStyle: 'list' | 'grid';
  emailNotifications: boolean;
  autoArchiveDays: number;
  favoriteGenres: string[];
};

/**
 * Server-side sessions (ADR 0002) -- the session id is the opaque value stored in the `session`
 * HttpOnly cookie. `ipAddress`/`userAgent` mirror creatorgrid's actual sessions table (captured at
 * login for account-security purposes, never exposed over the API); `deviceInfo` is a pairflix
 * addition carried forward from the current `UserSession` model.
 */
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    deviceInfo: text('device_info'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [index('idx_sessions_user').on(table.userId)]
);

/**
 * One-time tokens for email verification, password reset, and email-change confirmation --
 * consolidates the current `EmailVerification`/`PasswordReset` models into creatorgrid's unified
 * shape (ported rather than reinvented, per ADR 0001). `newEmail` is only set for
 * `purpose: 'change_email'`. `forcedByAdmin` is a pairflix addition carried forward from the current
 * `PasswordReset.forced_by_admin` flag.
 */
export const authTokens = sqliteTable(
  'auth_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    purpose: text('purpose')
      .$type<'verify_email' | 'password_reset' | 'change_email'>()
      .notNull(),
    newEmail: text('new_email'),
    forcedByAdmin: integer('forced_by_admin', { mode: 'boolean' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    consumedAt: integer('consumed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [index('idx_auth_tokens_user').on(table.userId)]
);

/** One row per unauthenticated request against a throttled route (see
 * services/api's `middleware/ip-rate-limit.ts`) -- counted, not read individually. `key` is
 * `<route>:<ip>` so each route's limit is independent (e.g. `register` spam doesn't burn down
 * `forgot-password`'s budget). No cleanup job for old rows -- D1 storage is cheap at this volume; a
 * future cron sweep could prune rows older than a day. */
export const rateLimitHits = sqliteTable(
  'rate_limit_hits',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [index('idx_rate_limit_hits_key').on(table.key)]
);

export const households = sqliteTable('households', {
  id: text('id').primaryKey(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

/** Ownership is `role = 'owner'` -- there is no `owner_id` column on `households`. */
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

export const householdInvites = sqliteTable(
  'household_invites',
  {
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
  },
  table => [index('idx_household_invites_household').on(table.householdId)]
);

export const tasteProfiles = sqliteTable('taste_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  weights: text('weights', { mode: 'json' }).$type<TasteWeights>().notNull(),
  embedding: text('embedding', { mode: 'json' }).$type<number[]>(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export type TasteWeights = {
  genres?: Record<string, number>;
  runtime_pref?: number | null;
  era?: Record<string, number>;
  tone?: Record<string, number>;
};

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
    enjoyed: integer('enjoyed', { mode: 'boolean' }),
    moodAtPick: text('mood_at_pick'),
    minutesBudgetAtPick: integer('minutes_budget_at_pick'),
  },
  table => [
    index('idx_wt_household_watched_at').on(table.householdId, table.watchedAt),
    index('idx_wt_household_tmdb').on(table.householdId, table.tmdbId),
  ]
);

/**
 * Doubles as a TMDb provider-availability cache (`providers`, refreshed by
 * `providers.service.ts`) and an admin content-moderation registry (`status`/`reportedCount`/
 * `removalReason`, referenced by `contentReports`) -- this is one table serving both purposes in
 * the current codebase, not two, so it's kept as one table here rather than split. `type` (the
 * moderation-facing movie/show/episode categorization) and `mediaType` (the TMDb-facing movie/tv
 * classification) are both real, distinct columns on the current model.
 */
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
    // The provider-cache read-through path always supplies a concrete mediaType, so this is
    // effectively "one content row per (tmdbId, mediaType)" for that path -- without it, two
    // concurrent cache-miss requests for the same title could each create a row.
    uniqueIndex('idx_content_tmdb_media_type').on(
      table.tmdbId,
      table.mediaType
    ),
  ]
);

export type ProviderEntry = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

export type ProviderRegion = {
  flatrate?: ProviderEntry[];
  free?: ProviderEntry[];
  ads?: ProviderEntry[];
  rent?: ProviderEntry[];
  buy?: ProviderEntry[];
  /** TMDb's own "watch this title" page for this title+region -- used to build provider-launch
   * deep links without a separate per-provider URL scheme (TMDb doesn't expose one). */
  link?: string;
};

export type ContentProviders = {
  [region: string]: ProviderRegion | string | undefined;
  last_updated_at?: string;
};

export const contentReports = sqliteTable(
  'content_reports',
  {
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
  },
  table => [index('idx_content_reports_content').on(table.contentId)]
);

/** Premium is `tier = 'premium' AND status = 'active' AND currentPeriodEnd > now`. `stripe*` stay
 * null until real Stripe is wired (see docs/roadmap.md). */
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
  table => [
    index('idx_pick_usage_household_picked_at').on(
      table.householdId,
      table.pickedAt
    ),
  ]
);

/** Backs the first-pick acceptance-rate KPI and affiliate attribution. */
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
    providerSlug: text('provider_slug'),
    region: text('region'),
    occurredAt: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => [
    index('idx_pe_household_occurred_at').on(
      table.householdId,
      table.occurredAt
    ),
    index('idx_pe_household_kind').on(table.householdId, table.kind),
  ]
);

/**
 * General leveled application logging (ops/debugging, admin-facing audit-log viewer) -- distinct
 * from creatorgrid's `auditLog`, which is specifically a record of admin moderation actions
 * (suspend/unsuspend/etc). Pairflix's current `AuditLog` model is this generic leveled-log shape,
 * so that's what's carried forward here; the table is still named `auditLogs` since that's the
 * concept it actually serves for this product.
 */
export const auditLogs = sqliteTable('audit_logs', {
  id: text('log_id').primaryKey(),
  level: text('level').$type<'info' | 'warn' | 'error' | 'debug'>().notNull(),
  message: text('message').notNull(),
  context: text('context', { mode: 'json' }).$type<Record<string, unknown>>(),
  source: text('source').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

/** Replaces `app_settings` -- a small key/value table for feature flags and other runtime config
 * that doesn't belong in a Worker var (needs to change without a redeploy). */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
  category: text('category').notNull().default('general'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type AuthTokenRow = typeof authTokens.$inferSelect;
export type RateLimitHitRow = typeof rateLimitHits.$inferSelect;
export type HouseholdRow = typeof households.$inferSelect;
export type HouseholdMemberRow = typeof householdMembers.$inferSelect;
export type HouseholdInviteRow = typeof householdInvites.$inferSelect;
export type TasteProfileRow = typeof tasteProfiles.$inferSelect;
export type WatchedTogetherRow = typeof watchedTogether.$inferSelect;
export type ContentRow = typeof content.$inferSelect;
export type ContentReportRow = typeof contentReports.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type PickUsageRow = typeof pickUsage.$inferSelect;
export type PickEventRow = typeof pickEvents.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
