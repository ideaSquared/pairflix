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

  /** Every request whose pathname starts with the given `/api/...` prefix. */
  requestsFor(method: string, pathnamePrefix: string): RecordedRequest[] {
    return this.requests.filter(
      r =>
        r.method === method.toUpperCase() &&
        r.pathname.startsWith(pathnamePrefix)
    );
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
