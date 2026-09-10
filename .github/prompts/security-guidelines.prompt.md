---
mode: 'agent'
description: 'Security best practices for application development'
applyTo: '**/*.{ts,tsx,js,jsx}'
---

# Security Guidelines

## General Security Considerations

- Sanitize all user inputs thoroughly.
- Parameterize database queries.
- Enforce strong Content Security Policies (CSP).
- Use CSRF protection where applicable.
- Ensure secure cookies (`HttpOnly`, `Secure` in production, `SameSite=Lax` -- session/CSRF cookies
  require the app and API to share a registrable domain, see `docs/runbook.md`'s "Cross-site
  cookies" section).
- Limit privileges and enforce role-based access control.
- Implement detailed internal logging and monitoring.

## Enhanced Security Requirements

### Authentication

- Opaque session token in D1, carried in an `HttpOnly` cookie (`SameSite=Lax`) -- not JWT; see
  `services/api/src/lib/session.ts`
- Double-submit CSRF token on state-changing requests
- Multi-factor authentication support (TOTP, required for admin accounts)
- Account lockout after failed attempts
- Password policy enforcement (PBKDF2 via Web Crypto -- no bcrypt on Workers)

### Data Protection

- PII encryption at rest
- Transport layer security (TLSv1.3)
- API keys rotation strategy
- Secrets management (no hardcoded values)
- Data anonymization for non-production

### Attack Prevention

- XSS prevention with Content-Security-Policy
- SQL injection protection
- CSRF token implementation
- Rate limiting with token bucket algorithm
- Input validation with schema validation
