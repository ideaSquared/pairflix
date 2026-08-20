# 🧪 Testing Strategy

This document outlines the testing approach for the Pairflix application, on the Cloudflare
stack described in `docs/adr/0001-cloudflare-stack.md`.

## Testing Principles

- **Test Pyramid**: more unit/lib tests than integration tests, and few end-to-end flows.
- **Behaviour-driven**: test through public APIs (routes, hooks, exported components), not
  internal structure 1:1.
- **Test-Driven Development**: critical features should be developed using TDD when possible.
- **Continuous Testing**: `pnpm test` (turbo, running every workspace's Vitest suite) runs on
  every commit via CI.

## Test Types

### Unit / Lib Tests

**`services/api` (`src/lib/*`)**:

- Business logic: recommendation scoring, taste-weight recompute, entitlements, providers,
  billing helpers.
- Co-located with their subject: `recommendation.ts` ↔ `recommendation.test.ts`.
- New `lib` module ⇒ one happy-path + one failure-mode test, minimum.

**Frontend (`apps/client`, `apps/admin`, `packages/lib.components`)**:

- Component rendering and variants.
- Hook behaviour.
- Form validation and state updates.

### Integration Tests

**`services/api` route tests (`src/routes/*.e2e.test.ts`)**:

- Full Hono app + real local D1 via `@cloudflare/vitest-pool-workers` (Miniflare) -- no mocked
  database, no Supertest. External calls (TMDb, Anthropic, Stripe, Resend) are the only thing
  mocked, via `fetch` interception in `src/test/test-helpers.ts`.
- Auth flow, household membership gates, quota/entitlement enforcement, race conditions (e.g.
  concurrent registrations hitting the same unique email).

**Frontend**:

- User workflows across multiple components (a full page's `render()` + `userEvent` flow).
- API service interactions, via `vi.mock()`/the test-only module aliases described below.

### End-to-End Tests

No browser-driven E2E suite exists yet. The `services/api` route tests above are the closest
thing to it today -- they exercise a real Hono app against a real local D1 instance, just without
a browser or the frontend in the loop.

## Testing Tools

Vitest everywhere -- see the ADR's rationale for standardizing on it across the monorepo instead
of splitting between Jest (frontend) and Vitest (`services/api`).

### `services/api` Stack

- **Vitest** + **`@cloudflare/vitest-pool-workers`**: runs tests inside a real Workers runtime
  (Miniflare) against local D1 -- the closest thing to testing against production.
- **`@vitest/coverage-v8`**: coverage.
- No Supertest, no Testcontainers, no in-memory SQLite -- D1 (SQLite-backed) _is_ the test
  database, provisioned locally by Miniflare.

### Frontend Stack (`apps/client`, `apps/admin`, `packages/lib.components`)

- **Vitest**, using its native `jsdom` environment (`test.environment: 'jsdom'` in each
  workspace's `vite.config.ts`) -- no separate Jest config, no `ts-jest`, no
  `@vanilla-extract/jest-transform`; Vite's own `vanilla-extract` plugin compiles `.css.ts` files
  for tests the same way it does for dev/build.
- **React Testing Library** (`@testing-library/react`, `@testing-library/user-event`,
  `@testing-library/jest-dom/vitest`).
- **`jest-axe`**: accessibility assertions in `packages/lib.components` (framework-agnostic
  despite the name -- just an `expect.extend()` matcher).
- No MSW. API calls are mocked per-file with `vi.mock()`, or -- for the common case of "don't hit
  the network at all" -- redirected wholesale to a hand-written fake via a `test.alias` entry in
  `vite.config.ts` (the Vitest equivalent of Jest's `moduleNameMapper`); see
  `apps/client/src/tests/__mocks__/api.ts` and its doc comment.

## Testing Patterns

### `services/api` Patterns

1. **Route (integration) tests** -- one file per route module, real D1, real middleware chain:

   ```typescript
   // src/routes/demo.e2e.test.ts
   it('returns 404 when no candidates match', async () => {
     mockExternalApis([]);
     const result = await demoPick(uniqueIp(), { mood: 'funny', minutes: 120 });

     expect(result.status).toBe(404);
     expect(result.body.error).toBe('No candidates found for these inputs');
   });
   ```

2. **`lib` tests** -- pure-ish business logic, mock only the external edges (TMDb/Anthropic
   fetches, not the database):

   ```typescript
   // src/lib/tasteWeights.test.ts
   it('nudges genre weights toward a rated title, decaying older ratings', () => {
     const next = nudgeGenreWeights(initialWeights, ratedGenreIds, enjoyed: true);
     expect(next[ratedGenreIds[0]]).toBeGreaterThan(initialWeights[ratedGenreIds[0]]);
   });
   ```

### Frontend Patterns

1. **Page/component tests** -- render with the shared `render()` helper (wraps providers:
   `QueryClientProvider`, `ThemeProvider`, `BrowserRouter`), mock the API layer, drive with
   `userEvent`:

   ```typescript
   // apps/client/src/features/landing/__tests__/LandingPage.test.tsx
   vi.mock('../../../services/api/demo', () => ({
     demo: { pick: vi.fn() },
   }));

   it('lets an anonymous visitor get one pick', async () => {
     (demo.pick as Mock).mockResolvedValue(RESULT);
     const user = userEvent.setup();
     render(<LandingPage />);

     await user.click(screen.getByRole('button', { name: 'Show me a pick' }));

     await waitFor(() => {
       expect(screen.getByText('Test Movie')).toBeInTheDocument();
     });
   });
   ```

2. **Component library tests** (`packages/lib.components`) -- one happy-path render + variant
   coverage + an accessibility check per component, using `jest-axe`.

## Mock Strategies

### API Mocking (Frontend)

Two layers, matching what Jest's `moduleNameMapper` used to do plus per-test overrides:

- **Blanket redirect**: a `test.alias` entry in each workspace's `vite.config.ts` sends every
  import of `services/api` (any relative depth) to a hand-written fake
  (`src/tests/__mocks__/api.ts`) that returns sane defaults for everything, so a test that doesn't
  care about the API layer doesn't have to mock it.
- **Per-file override**: a test that cares about a specific call layers its own `vi.mock()` on
  top, spreading `await vi.importActual(...)` (which -- because of the alias above -- actually
  resolves to the shared fake, not the real network-calling module) and replacing just the
  function(s) under test.

### External API Mocking (`services/api`)

TMDb/Anthropic/Stripe/Resend calls go through the Worker's global `fetch`; `test-helpers.ts`
intercepts `fetch` itself (`mockExternalApis(...)`) so route tests never make a real network call,
while everything else (auth, sessions, D1 reads/writes) runs for real against local D1.

## Test Data Management

- Route tests build their own fixtures inline (`createLoggedInUser`, `createLoggedInAdmin`,
  `uniqueEmail()` helpers in `src/test/test-helpers.ts`) rather than a shared seed -- each test
  gets fresh, isolated rows.
- `services/api/scripts/seed-dev-users.mjs` seeds fixture accounts for _manual_ local dev
  (`DevLogin`), not for the automated test suite.

## Continuous Integration

Tests run in CI on:

- Pull request creation
- Updates to pull requests
- Merges to `master`

The CI pipeline (via `turbo`):

1. Installs dependencies
2. Runs linting checks (`pnpm lint`)
3. Type-checks every workspace (`pnpm -r type-check`)
4. Runs each workspace's Vitest suite (`pnpm test`)
5. Generates coverage (`pnpm test:coverage`)

## Test Organization

### `services/api` Structure

```
services/api/
├── src/
│   ├── routes/
│   │   ├── demo.ts
│   │   ├── demo.e2e.test.ts
│   │   └── ...
│   ├── lib/
│   │   ├── recommendation.ts
│   │   ├── recommendation.test.ts   (where present)
│   │   └── ...
│   └── test/
│       └── test-helpers.ts          (callApp, mockExternalApis, fixture helpers)
```

### Frontend Structure

```
apps/client/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── LoginPage.test.tsx
│   │   │   │   └── ...
│   │   │   └── LoginPage.tsx
│   │   └── ...
│   └── tests/
│       ├── setup.tsx        (render() helper, matchMedia shim)
│       └── __mocks__/
│           └── api.ts       (shared fake, wired via test.alias)

packages/lib.components/
├── src/
│   └── components/
│       └── <Category>/<Component>/
│           ├── Component.tsx
│           └── Component.test.tsx   (co-located, not in __tests__/)
├── setupTests.tsx            (jest-dom matchers, ResizeObserver mock, jest-axe config)
```

## Best Practices

1. **Isolation**: each test should be independent and not rely on the state from other tests.
2. **Readability**: tests should be easy to read and understand.
3. **Maintainability**: tests should be easy to maintain and update.
4. **Speed**: tests should run quickly to provide fast feedback.
5. **Focus**: each test should focus on testing one thing.
6. **Don't mock what you own**: extract a seam instead of mocking internal modules; mocking is for
   the actual boundary (network calls, the API layer as seen from a frontend component).

## Test Documentation

- Test files should include a brief description of what they test.
- Complex test cases should include comments explaining a non-obvious setup or assertion -- not
  what the test does, which the `it(...)` description already says.
- Test fixtures should be documented with their purpose and structure where it isn't obvious from
  the fixture itself.
