# PairFlix Client

The user-facing React SPA for PairFlix's household "what should we watch tonight" product --
onboarding, the Tonight picker, pick history, household management, and billing.

**Status: pre-launch alpha.** No production deploy exists yet -- see the root
[`README.md`](../../README.md) and `docs/runbook.md`.

## Features

- **Tonight picker** (`src/features/tonight`) -- mood + time budget in, one title out, with
  provider deep-links
- **Taste onboarding** (`src/features/onboarding`) -- swipe-style taste-profile setup
- **History** (`src/features/history`) -- past picks, accept/swap/dismiss outcomes
- **Households** (`src/features/households`) -- membership, invites
- **Billing** (`src/features/billing`) -- mock and (when configured) real Stripe checkout
- **Auth** (`src/features/auth`) -- login/register/reset, session-cookie based

## Technology Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Routing:** React Router
- **Server state:** React Query (`@tanstack/react-query`)
- **Styling:** vanilla-extract (`Component.css.ts` colocated with each component), theme tokens from
  `@pairflix/components` -- no CSS modules, no Tailwind, no styled-components
- **UI primitives:** shared component library (`@pairflix/components`, `packages/lib.components`)
- **HTTP:** the `fetch`-based service clients in `src/services/api`, not Axios
- **Tests:** Vitest (jsdom) + React Testing Library

## Quick Start

### Prerequisites

- Node.js 22.x (see the repo root `.nvmrc`) and pnpm 10
- `services/api` running (`pnpm --filter @pairflix/api dev`) -- the client proxies `/api/*` to it

### Installation

From the repo root:

```bash
pnpm install
cp apps/client/.env.example apps/client/.env   # optional -- see below
pnpm --filter @pairflix/client dev
```

The app is available at `http://localhost:5173`.

### Environment variables

See [`.env.example`](./.env.example) for the full, current list (`VITE_API_URL`,
`VITE_BILLING_MOCK_ENABLED`, `VITE_AFFILIATE_PARAMS`) with usage notes for each. Leave them unset for
local dev -- the Vite dev server proxies `/api/*` to the Worker, which keeps requests same-origin so
the session/CSRF cookies (`SameSite=Lax`) are sent.

## Project Structure

```
apps/client/
├── public/              # static assets (_headers, _redirects)
├── src/
│   ├── features/        # feature folders: pages, components, hooks, types, owned by one feature
│   ├── components/      # cross-feature UI not yet promoted to packages/lib.components
│   ├── contexts/        # auth, theme
│   ├── hooks/           # cross-feature hooks
│   ├── services/        # API clients calling /api
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── wrangler.jsonc        # Cloudflare Pages config
```

## Authentication

Cookie-based, not JWT: the browser sends the `session` cookie automatically on same-origin requests.
There is no token to store and nothing is ever written to `localStorage` for auth. Writes echo a CSRF
token (`GET /api/auth/csrf-token`, then `x-csrf-token` header) alongside the cookie. See
`docs/architecture.md`'s "Auth & CSRF" section.

Because the cookie is `SameSite=Lax`, the client and `services/api` need to share a registrable
domain (or Pages needs to proxy `/api` to the Worker) in any real deployment -- see
`docs/runbook.md`'s "Cross-site cookies" section.

## Testing

```bash
pnpm --filter @pairflix/client test            # run once
pnpm --filter @pairflix/client test:watch      # watch mode
pnpm --filter @pairflix/client test:coverage   # with coverage
```

Playwright end-to-end tests for this app live in the repo-root `e2e/` workspace, not here.

## Development Scripts

```bash
pnpm --filter @pairflix/client dev          # start dev server
pnpm --filter @pairflix/client build        # production build (tsc && vite build)
pnpm --filter @pairflix/client type-check
pnpm --filter @pairflix/client lint
pnpm --filter @pairflix/client format
```

## Deployment

```bash
pnpm --filter @pairflix/client deploy   # build, then wrangler pages deploy
```

Deployed to Cloudflare Pages -- no Docker, no nginx. `public/_headers` sets the CSP, HSTS, and other
security headers Pages applies to every response. See the root
[`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) and `docs/runbook.md` for the
full first-deploy procedure.

---

For more, see the [root README](../../README.md), `docs/architecture.md`, and the
[component library](../../packages/lib.components/README.md).
