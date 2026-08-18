# Pairflix documentation

> **Pairflix is the household "what should WE watch tonight" decision layer.** Pre-launch alpha.
> The platform is re-platforming onto Cloudflare (ADR 0001). Docs that predate the pivot are marked
> **historical** below — don't build from them.

## Start here

- [**ADR 0001 — Cloudflare stack**](./adr/0001-cloudflare-stack.md) — the stack decision and why
- [**ADR 0002 — Session-cookie auth**](./adr/0002-session-cookie-auth.md) — the auth model on Workers
- [**Architecture**](./architecture.md) — target topology, the pick path, auth, tenancy
- [**Product Requirements**](./prd.md) — what Pairflix is (household decision layer) and is not
- [**Roadmap**](./roadmap.md) — real code state, the re-platform phases, path to alpha
- [**Database schema**](./db-schema.md) — the D1 / Drizzle schema
- [**Development setup**](./dev-setup.md) — pnpm + wrangler + local D1
- [**Decision log**](./decision-log.md) — decision history (recent decisions live as ADRs)

## Decision records

ADRs live in [`docs/adr/`](./adr/). Add one for any decision that reframes how the system is built.

## Target layout

The re-platform moves the code to the sibling-repo layout (`adopt-dont-shop` / `creatorgrid`):

```
apps/client · apps/admin        # Vite + React SPAs on Cloudflare Pages
services/api                     # Hono Worker (routes / middleware / lib)
packages/db                      # Drizzle schema + client + migrations
packages/lib.*                   # shared components / types / api / utils / validation
docs/                            # this directory
```

Until the cutover phase lands, the code still lives in `backend/`, `app.client/`, `app.admin/`,
`lib.components/` on npm — see the roadmap for which phase each piece is in.

## Historical (pre-pivot — retained for context, not current)

These describe the retired two-user watchlist product and the old npm/Docker stack:

- `api-docs.md`, `testing-strategy.md`, `admin-auth-improvements.md`, `account-creation.md`
- `component-deduplication-summary.md`, `datatable-migration-guide.md`
- `phase-3-completion-summary.md`, `phase3-implementation-plan.md`, `phase3/`

They can be pruned once their still-useful content is folded into the docs above.

## Contributing to docs

1. Keep docs current — update them in the same PR as the code change.
2. Record significant decisions as an ADR in `docs/adr/`.
3. One schema change = one Drizzle migration + a `db-schema.md` update, same PR.
4. Update this index when you add or retire a doc.
