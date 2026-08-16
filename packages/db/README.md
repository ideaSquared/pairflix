# @pairflix/db

Drizzle schema + typed client for Pairflix's D1 database. See `docs/db-schema.md` for the full table
reference; `src/schema.ts` is the source of truth.

## Bundler-only consumption

`main`/`exports` point straight at `.ts` source (no build step), matching creatorgrid's `packages/db`.
This works for every intended consumer: the future Hono Worker (bundled by `wrangler`) and this
package's own Vitest tests (esbuild-transpiled). It will **not** work if imported from a plain
unbundled Node.js script (`node foo.js`) or any other consumer that doesn't transpile TypeScript
itself. If that need ever comes up, add a `build` script emitting `dist/` and point `main`/`exports` at
the compiled output instead — don't reach for `ts-node`/`tsx` as a workaround.
