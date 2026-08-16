import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

// Setup files run outside per-test-file storage isolation and may run more than once;
// `applyD1Migrations` only applies migrations that haven't already been applied, so this is safe
// to call unconditionally. `env.TEST_MIGRATIONS` is supplied via `miniflare.bindings` in
// vitest.config.ts, read from packages/db/migrations at config time.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
