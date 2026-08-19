# Security

Security measures actually implemented in `services/api`, the Hono Worker. For the broader system
design see `docs/architecture.md` (repo root); for the `users`/`sessions`/`audit_logs` columns these
rely on, see `docs/db-schema.md`.

## Authentication

- **Session cookie, not JWT.** `POST /api/auth/login` creates a D1 `sessions` row and sets its id as
  an HttpOnly, `SameSite=Lax` `session` cookie (`Secure` when `ENVIRONMENT=production`) —
  `middleware/auth.ts`'s `sessionMiddleware` resolves the caller from it on every request.
- **Passwords**: PBKDF2 via Web Crypto (`lib/crypto.ts`) — Workers has no native bcrypt.
- **Account lockout**: `FAILED_ATTEMPT_LIMIT` (5) consecutive bad logins locks the account for
  `LOCKOUT_MS` (15 minutes) — see `lib/session.ts`.
- **Double-submit CSRF**: `middleware/csrf.ts` requires state-changing `/api/*` requests to echo the
  readable `csrfToken` cookie back as an `x-csrf-token` header, compared with `timingSafeEqual`.
  Fetch it from `GET /api/auth/csrf-token`.
- **TOTP 2FA** (`lib/totp.ts`, `lib/two-factor.ts`): optional for regular accounts, required for
  admins — `requireAdmin` (`middleware/auth.ts`) 403s every `/api/admin/*` request until
  `POST /api/me/2fa/verify` has completed once. Secrets are AES-256-GCM encrypted at rest
  (`lib/crypto.ts`), keyed off the `SESSION_SECRET` Worker secret.
- Sensitive changes (password reset, 2FA disable) revoke the caller's other sessions.

## Rate limiting

`middleware/ip-rate-limit.ts` is D1-backed (counts recent `rate_limit_hits` rows per `routeName:ip`
key in a rolling window) rather than in-memory, since a Worker isolate doesn't persist state between
requests. Applied to the unauthenticated routes that don't yet have a session to rate-limit by user:
`POST /api/auth/register`, `/forgot-password`, and `/resend-verification`, each capped at 5 requests
per 15 minutes per IP. Keyed on `cf-connecting-ip`, which only real Cloudflare edge traffic sets —
requests without it (local `wrangler dev`, direct Worker invocation in tests) skip the check.

## Transport & headers

`src/index.ts` applies `hono/secure-headers` (relaxed `crossOriginResourcePolicy: 'cross-origin'`,
since apps/client and apps/admin call this API cross-origin with credentials by design; no CSP, since
this Worker only ever returns JSON) and `hono/cors`, restricted to the origins listed in the
`ALLOWED_ORIGINS` Worker var.

## Audit logging

`lib/audit.ts` writes structured rows (`level`, `message`, `source`, JSON `context`) to the
`audit_logs` D1 table for auth and admin actions. `GET /api/admin/audit-logs` (paginated) and
`POST /api/admin/audit-logs/rotation` (manual retention sweep, source `admin`) expose it to admins;
`rotateAuditLogsOnSchedule` (`lib/adminAuditLogs.ts`, source `cron`) runs the same sweep
automatically via a daily Cloudflare Cron Trigger (`wrangler.jsonc`'s `triggers.crons`) — see
`docs/roadmap.md`'s P3 billing/admin notes for the history.

## Known gaps

Documented rather than silently left out — see `docs/roadmap.md` for the phase each was deferred in:

- No cron-driven provider-cache refresh (lazy/on-demand only) -- unlike audit-log retention, its
  scope (what to refresh, on what interval, at what TMDb-quota cost) isn't decided yet.
- Real Stripe billing is deferred; the current billing routes are an explicit mock.
