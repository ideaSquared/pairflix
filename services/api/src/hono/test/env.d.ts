import type { Bindings } from '../types';

// `cloudflare:workers`'s `env` export is typed against this ambient `Cloudflare.Env` interface
// (from @cloudflare/workers-types) -- extend it with our real Bindings plus the test-only binding
// vitest.config.ts injects.
declare namespace Cloudflare {
  interface Env extends Bindings {
    TEST_MIGRATIONS: import('cloudflare:test').D1Migration[];
  }
}
