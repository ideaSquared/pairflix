import { expect, test } from '@playwright/test';
import { ApiMock, json, seedAuthedSession } from './support/authed-api-mock';

const card = (tmdbId: number, title: string) => ({
  tmdbId,
  mediaType: 'movie',
  title,
  posterPath: null,
  genreIds: [28],
});

const withDeck = (mock: ApiMock): ApiMock =>
  mock.on('GET', '/api/me/taste-onboarding/deck', ({ route }) =>
    json(route, 200, {
      data: { cards: [card(1, 'Movie A'), card(2, 'Movie B')] },
    })
  );

test('walks the genres -> swipe -> providers steps and submits', async ({
  page,
}) => {
  const mock = withDeck(seedAuthedSession());
  mock.on('POST', '/api/me/taste-onboarding', ({ route }) =>
    json(route, 200, { data: { ok: true } })
  );
  await mock.install(page);

  await page.goto('/onboarding/taste');

  // Step 1: genres
  await page.getByRole('button', { name: 'Action' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: swipe through the deck
  await page.getByRole('button', { name: 'Love it' }).click();
  await page.getByRole('button', { name: 'Not for me' }).click();
  await expect(page.getByText(/That's everything for now/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3: providers, then finish
  await page.getByRole('checkbox', { name: 'Netflix' }).check();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page).toHaveURL('/tonight');
  const submit = mock.requests.find(
    r => r.pathname === '/api/me/taste-onboarding'
  );
  expect(submit?.body).toMatchObject({
    likedGenreIds: [28],
    swipes: [
      { tmdbId: 1, verdict: 'love' },
      { tmdbId: 2, verdict: 'not_for_me' },
    ],
    providers: ['netflix'],
  });
});

test('skip goes to the requested internal next path', async ({ page }) => {
  const mock = withDeck(seedAuthedSession());
  mock.on('GET', '/api/households/:id/history', ({ route }) =>
    json(route, 200, {
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    })
  );
  await mock.install(page);

  await page.goto('/onboarding/taste?next=%2Fhistory');
  await page.getByRole('button', { name: 'Skip' }).click();

  await expect(page).toHaveURL('/history');
});

test('skip rejects an external next path and falls back to tonight', async ({
  page,
}) => {
  const mock = withDeck(seedAuthedSession());
  await mock.install(page);

  await page.goto('/onboarding/taste?next=//evil.com');
  await page.getByRole('button', { name: 'Skip' }).click();

  await expect(page).toHaveURL('/tonight');
});
