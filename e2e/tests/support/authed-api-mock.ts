import type { Page, Route } from '@playwright/test';

/**
 * A small stateful fake of the Pairflix `/api` surface for browser e2e. The client is cookie-auth --
 * on mount it calls `GET /api/auth/me`; returning a user there is what makes the SPA consider the
 * browser "logged in", so these tests need no real session cookie. Handlers are matched by method +
 * path pattern (with `:param` segments); later registrations win, so a spec can register a default
 * session and then override a single endpoint (e.g. make a pick 402 for the quota journey).
 */

export const json = (
  route: Route,
  status: number,
  body: unknown
): Promise<void> =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

export type HandlerContext = {
  route: Route;
  params: Record<string, string>;
  body: unknown;
  method: string;
  pathname: string;
};

export type Handler = (ctx: HandlerContext) => Promise<void> | void;

type RouteEntry = { method: string; segments: string[]; handler: Handler };

const matchSegments = (
  pattern: string[],
  actual: string[]
): Record<string, string> | null => {
  if (pattern.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i += 1) {
    const p = pattern[i] ?? '';
    const a = actual[i] ?? '';
    if (p.startsWith(':')) params[p.slice(1)] = a;
    else if (p !== a) return null;
  }
  return params;
};

export type RecordedRequest = {
  method: string;
  pathname: string;
  body: unknown;
};

export class ApiMock {
  private readonly routes: RouteEntry[] = [];
  readonly requests: RecordedRequest[] = [];

  /** Register a handler for `method` + `pattern` (e.g. 'POST', '/api/households/:id/pick'). */
  on(method: string, pattern: string, handler: Handler): this {
    this.routes.push({
      method: method.toUpperCase(),
      segments: pattern.split('/').filter(Boolean),
      handler,
    });
    return this;
  }

  async install(page: Page): Promise<void> {
    // Anchored to a `/api/` path at the root of the origin so the app's own source modules under
    // `src/services/api/**` (served by the dev server) are never intercepted.
    await page.route(/^https?:\/\/[^/]+\/api\//, async route => {
      const url = new URL(route.request().url());
      const method = route.request().method();
      const actual = url.pathname.split('/').filter(Boolean);

      let body: unknown;
      const raw = route.request().postData();
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = raw;
        }
      }
      this.requests.push({ method, pathname: url.pathname, body });

      for (let i = this.routes.length - 1; i >= 0; i -= 1) {
        const entry = this.routes[i]!;
        if (entry.method !== method) continue;
        const params = matchSegments(entry.segments, actual);
        if (params) {
          await entry.handler({
            route,
            params,
            body,
            method,
            pathname: url.pathname,
          });
          return;
        }
      }

      await json(route, 404, { error: `unmocked ${method} ${url.pathname}` });
    });
  }
}

export type MockAuthUser = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
  emailVerified: boolean;
  totpEnabled: boolean;
  preferences: {
    theme: 'light' | 'dark';
    viewStyle: 'grid' | 'list';
    emailNotifications: boolean;
    autoArchiveDays: number;
    favoriteGenres: string[];
    selectedProviders?: string[];
  };
  createdAt: string;
};

export type MockHousehold = {
  id: string;
  name: string | null;
  role: 'owner' | 'member';
  joinedAt: string;
  memberCount: number;
};

export type MockEntitlements = {
  tier: 'free' | 'premium';
  dailyPickLimit: number;
  picksUsedToday: number;
  picksRemaining: number;
  canUseLlmRerank: boolean;
  canUseMultiRegion: boolean;
  regionLock: string | null;
};

const DEFAULT_USER: MockAuthUser = {
  id: 'u1',
  username: 'e2euser',
  email: 'e2e@example.com',
  role: 'user',
  status: 'active',
  emailVerified: true,
  totpEnabled: false,
  preferences: {
    theme: 'dark',
    viewStyle: 'grid',
    emailNotifications: true,
    autoArchiveDays: 30,
    favoriteGenres: [],
    selectedProviders: ['netflix', 'prime', 'disney_plus'],
  },
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_HOUSEHOLD: MockHousehold = {
  id: 'hh1',
  name: 'Movie Mondays',
  role: 'owner',
  joinedAt: '2026-01-01T00:00:00.000Z',
  memberCount: 1,
};

const DEFAULT_ENTITLEMENTS: MockEntitlements = {
  tier: 'free',
  dailyPickLimit: 3,
  picksUsedToday: 0,
  picksRemaining: 3,
  canUseLlmRerank: false,
  canUseMultiRegion: false,
  regionLock: 'GB',
};

export type SessionOverrides = {
  user?: Partial<MockAuthUser>;
  households?: MockHousehold[];
  entitlements?: Partial<MockEntitlements>;
};

/**
 * An ApiMock preloaded with a logged-in session: `GET /api/auth/me` returns a user, the CSRF
 * preflight is answered, and the shared `GET /api/households` + entitlements resolve. Journey specs
 * register their own endpoints (pick, commit, history, ...) on top; later registrations win.
 */
export const seedAuthedSession = (
  overrides: SessionOverrides = {}
): ApiMock => {
  const user: MockAuthUser = {
    ...DEFAULT_USER,
    ...overrides.user,
    preferences: {
      ...DEFAULT_USER.preferences,
      ...overrides.user?.preferences,
    },
  };
  const households = overrides.households ?? [DEFAULT_HOUSEHOLD];
  const entitlements: MockEntitlements = {
    ...DEFAULT_ENTITLEMENTS,
    ...overrides.entitlements,
  };

  return new ApiMock()
    .on('GET', '/api/auth/me', ({ route }) => json(route, 200, { data: user }))
    .on('GET', '/api/auth/csrf-token', ({ route }) =>
      json(route, 200, { csrfToken: 'test-csrf-token' })
    )
    .on('GET', '/api/households', ({ route }) =>
      json(route, 200, { households })
    )
    .on('GET', '/api/households/:id/entitlements', ({ route }) =>
      json(route, 200, entitlements)
    );
};

/**
 * An ApiMock for logged-out flows: `GET /api/auth/me` returns 401 (with the exact message useAuth
 * checks so it doesn't retry), and the CSRF preflight is answered. Specs register the auth endpoints
 * they exercise (verify-email, reset-password, ...).
 */
export const seedLoggedOut = (): ApiMock =>
  new ApiMock()
    .on('GET', '/api/auth/me', ({ route }) =>
      json(route, 401, { error: 'Authentication required' })
    )
    .on('GET', '/api/auth/csrf-token', ({ route }) =>
      json(route, 200, { csrfToken: 'test-csrf-token' })
    );
