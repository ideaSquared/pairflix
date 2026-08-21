import { expect, test } from '@playwright/test';
import { json, seedAuthedSession } from './support/authed-api-mock';

const entry = (enjoyed: boolean | null = null) => ({
  id: 'watched1',
  tmdbId: 27205,
  mediaType: 'movie',
  watchedAt: '2026-01-01T00:00:00.000Z',
  enjoyed,
  moodAtPick: 'feelgood',
  minutesBudgetAtPick: 90,
  title: 'Inception',
  year: 2010,
  posterPath: null,
  providers: {},
});

const historyPage = (entries: unknown[]) => ({
  data: entries,
  pagination: {
    page: 1,
    limit: 50,
    total: entries.length,
    totalPages: entries.length > 0 ? 1 : 0,
  },
});

test('renders the watch-together history list', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('GET', '/api/households/:id/history', ({ route }) =>
    json(route, 200, historyPage([entry()]))
  );
  await mock.install(page);

  await page.goto('/history');

  await expect(
    page.getByRole('heading', { name: 'Watch Together History' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Inception (2010)' })
  ).toBeVisible();
  await expect(page.getByText(/^Watched /)).toBeVisible();
});

test('rates an entry with a thumbs-up', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('GET', '/api/households/:id/history', ({ route }) =>
    json(route, 200, historyPage([entry()]))
  );
  mock.on('PATCH', '/api/households/:id/history/:watchedId', ({ route }) =>
    json(route, 200, { entry: entry(true) })
  );
  await mock.install(page);

  await page.goto('/history');
  await page.getByRole('button', { name: 'We enjoyed it' }).click();

  await expect
    .poll(() =>
      mock.requests.some(
        r => r.pathname === '/api/households/hh1/history/watched1'
      )
    )
    .toBe(true);
  const rate = mock.requests.find(
    r => r.pathname === '/api/households/hh1/history/watched1'
  );
  expect(rate?.method).toBe('PATCH');
  expect(rate?.body).toMatchObject({ enjoyed: true });
});

test('shows the empty state when nothing has been watched', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  mock.on('GET', '/api/households/:id/history', ({ route }) =>
    json(route, 200, historyPage([]))
  );
  await mock.install(page);

  await page.goto('/history');

  await expect(page.getByText(/Nothing here yet/)).toBeVisible();
});

test('shows the no-household state when the user has none', async ({
  page,
}) => {
  const mock = seedAuthedSession({ households: [] });
  await mock.install(page);

  await page.goto('/history');

  await expect(page.getByText(/not in a household yet/i)).toBeVisible();
});
