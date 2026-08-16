# ADR 0002 — Session-cookie auth on Workers (retire JWT)

- **Status:** Accepted
- **Date:** 2026-08-16
- **Deciders:** Alex Jenkinson
- **Relates to:** ADR 0001 (Cloudflare re-platform)

## Context

The pre-pivot backend authenticates with **JWT bearer tokens** (`Authorization: Bearer`), `req.user`
populated by `authMiddleware`, passwords hashed with **bcrypt**, and the SPA storing/attaching the
token. ADR 0001 moves the API to Cloudflare Workers, where **bcrypt has no native implementation** —
so the password-hashing scheme has to change regardless of which auth model we pick.

The `creatorgrid` sibling already runs a full auth surface on Workers: opaque session tokens in D1,
PBKDF2 via Web Crypto, double-submit CSRF, login lockout, TOTP 2FA, email verification, and password
reset.

## Decision

**Adopt creatorgrid's session-cookie model. Retire JWT.**

- **Opaque session token** stored in D1 (`sessions`), carried in an HttpOnly `session` cookie;
  `requireAuth` middleware resolves the caller by looking the token up.
- **Passwords hashed with PBKDF2 via Web Crypto** (no bcrypt on Workers).
- **Double-submit CSRF** on state-changing requests: a readable `csrfToken` cookie echoed back as an
  `x-csrf-token` header, compared with `timingSafeEqual`.
- Sensitive actions (password change, 2FA disable, password reset) **revoke other sessions**.
- Port creatorgrid's `sessions` / `auth_tokens` tables and the auth route module wholesale, adapting
  names to the Pairflix domain.

## Options considered

### A. Session cookie + PBKDF2 + CSRF (creatorgrid) — chosen

- PBKDF2 via Web Crypto is the **native** Workers answer; bcrypt can't run there anyway.
- **Opaque D1 sessions are revocable** — "log out everywhere", password-reset invalidation, 2FA, and
  account suspension all need server-side revocation.
- **HttpOnly cookie removes the SPA token-storage (XSS) risk** and simplifies the frontend: nothing to
  store or attach (the API client only echoes the CSRF token on writes).
- Mostly a **port** of proven creatorgrid code, not a fresh build.

### B. JWT on Workers (short-lived access + refresh-token rotation) — rejected

Keeps the current mental model, but still forces the bcrypt→PBKDF2 change, and to get revocation
(logout-everywhere, reset invalidation, suspension) you reintroduce server-side state via a
refresh-token store / denylist — i.e. you rebuild sessions with extra moving parts, for less security
than an HttpOnly cookie. More work, worse outcome.

## Consequences

- **Frontend:** no token handling. The browser sends the `session` cookie automatically; the API
  client fetches `GET /api/auth/csrf-token` and echoes `x-csrf-token` on writes. `localStorage` is
  never touched for auth.
- **CORS:** the SPA (Pages) and API (Worker) are on different origins, so cookies need
  `SameSite`/`credentials` and an `ALLOWED_ORIGINS` allowlist — creatorgrid's config is the template.
- **Schema:** adds `sessions` and `auth_tokens` to `packages/db` (see `docs/db-schema.md`).
- **Trade-off:** a future **native mobile** client handles cookies less naturally than bearer tokens.
  Not a concern for the web-first alpha; revisit if/when a React Native app is on the table (a
  token-exchange endpoint can be added then without disturbing the web flow).
