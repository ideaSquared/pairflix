# PairFlix Admin

The admin panel for PairFlix -- a separate SPA from `apps/client`, for user management, content
moderation, audit logs, and settings.

**Status: pre-launch alpha.** No production deploy exists yet -- see the root
[`README.md`](../../README.md) and `docs/runbook.md`.

Only touch this app if a task explicitly names admin scope (see the repo root `CLAUDE.md`).

## Features

- **Dashboard** -- key metrics and recent activity
- **User Management** -- search, view, and manage user accounts; forced password reset; session
  termination
- **Content Moderation** -- review and act on reported content
- **Audit Logs** -- filterable log of admin and system actions, with retention rotation
- **Settings** -- application-wide configuration

## Getting Started

### Prerequisites

- Node.js 22.x (see the repo root `.nvmrc`) and pnpm 10
- `services/api` running (`pnpm --filter @pairflix/api dev`) -- the admin app proxies `/api/*` to it
- An admin account (see `docs/dev-setup.md`'s seed data, or `POST /api/auth/bootstrap-admin`)

### Installation

From the repo root:

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env   # optional -- see .env.example
pnpm --filter @pairflix/admin dev
```

The admin panel is available at `http://localhost:5174`.

## Development

The admin app is a separate application from `apps/client` for a few reasons:

1. **Security separation** -- keeps admin functionality isolated from user functionality
2. **Independent deployment** -- can be deployed to a different domain/subdomain
3. **Tailored UI/UX** -- admin interfaces have different needs than user interfaces
4. **Permission control** -- easier to manage admin-only permissions

### Key files

- `src/App.tsx` -- main application component with routing
- `src/hooks/useAuth.ts` -- authentication hook for admin users
- `src/services/api/` -- API clients calling `/api`
- `src/features/admin/` -- dashboard, user management, content moderation, audit logs, settings

### Adding new admin features

1. Create a folder in `src/features/<feature-name>`
2. Add components/pages in that folder
3. Add a route in `App.tsx`
4. Add a navigation link in the admin layout

## Authentication

Cookie-based, not JWT: the browser sends the `session` cookie automatically. There is no token to
store and nothing is written to `localStorage` for auth. Admin accounts additionally require TOTP 2FA
(`requireAdmin` 403s until enrolled). Writes echo a CSRF token alongside the cookie -- see
`docs/architecture.md`'s "Auth & CSRF" section.

Because the cookie is `SameSite=Lax`, the admin app and `services/api` need to share a registrable
domain (or Pages needs to proxy `/api` to the Worker) in any real deployment -- see
`docs/runbook.md`'s "Cross-site cookies" section.

## Deployment

```bash
pnpm --filter @pairflix/admin deploy   # build, then wrangler pages deploy
```

Deployed to Cloudflare Pages -- no Docker, no nginx. `public/_headers` sets the CSP, HSTS, and other
security headers Pages applies to every response. See the root
[`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) and `docs/runbook.md` for the
full first-deploy procedure, including running this app on its own domain/subdomain with access
restricted to admins.

## Security Considerations

- Always use HTTPS in production (the session cookie is marked `Secure` once `ENVIRONMENT=production`)
- Consider IP restrictions or a separate access policy for the admin domain
- Rate limiting on admin login is already enforced by `services/api`'s middleware
- Admin accounts require TOTP 2FA
