import type { Page, Route } from '@playwright/test';

type RouteHandler = (route: Route, url: URL) => Promise<void> | void;

/** Fulfills a route with a JSON body. */
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

/**
 * Intercepts every `/api/**` request so specs run without a live Worker or D1. `handlers` is keyed
 * by `"<METHOD> <pathname>"` (e.g. `"POST /api/demo/pick"`); anything not listed falls back to a
 * logged-out default: `GET /api/auth/me` -> 401 (which the client treats as "signed out"),
 * `GET /api/auth/csrf-token` -> a token (fetchWithAuth seeds one before every write), and any other
 * path -> 404 so an unstubbed call fails loudly instead of leaking to the dev-server proxy.
 */
export const installApiMock = async (
  page: Page,
  handlers: Record<string, RouteHandler> = {}
): Promise<void> => {
  // Anchored to a `/api/` path at the root of the origin -- a bare `**/api/**` glob would also
  // swallow the app's own source modules under `src/services/api/**` (dev server) and break the
  // page load.
  await page.route(/^https?:\/\/[^/]+\/api\//, async route => {
    const url = new URL(route.request().url());
    const key = `${route.request().method()} ${url.pathname}`;

    const handler = handlers[key];
    if (handler) {
      await handler(route, url);
      return;
    }

    if (url.pathname === '/api/auth/me') {
      await json(route, 401, { error: 'Authentication required' });
      return;
    }
    if (url.pathname === '/api/auth/csrf-token') {
      await json(route, 200, { csrfToken: 'test-csrf-token' });
      return;
    }
    await json(route, 404, { error: `unmocked: ${key}` });
  });
};
