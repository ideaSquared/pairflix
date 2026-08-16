import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for the D1 (SQLite) schema.
 *
 * `pnpm db:generate` diffs `src/schema.ts` and writes a new migration into
 * `migrations/`. The Worker applies those migrations with
 * `wrangler d1 migrations apply` (see services/api).
 */
export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
});
