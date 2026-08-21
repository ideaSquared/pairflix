import { expect, test, type Page } from '@playwright/test';
import { json, seedAuthedSession } from './support/authed-api-mock';

const pickResult = (tmdbId: number, title: string, withProvider = true) => ({
  pick: {
    tmdbId,
    mediaType: 'movie',
    title,
    year: 2010,
    runtime: 148,
    overview: `${title} overview.`,
    posterPath: null,
    providers: withProvider
      ? {
          flatrate: [
            { provider_id: 8, provider_name: 'Netflix', logo_path: '/x.jpg' },
          ],
        }
      : {},
  },
  alternates: [],
  rationale: `Because ${title}.`,
  score: 0.9,
});

// Nudge the range slider by `steps` increments (step = 5 min). Real key presses, because a
// programmatic value set is swallowed by React's controlled-input value tracker and onChange never
// fires.
const nudgeMinutes = async (page: Page, steps: number): Promise<void> => {
  const slider = page.locator('input[type="range"]');
  await slider.focus();
  for (let i = 0; i < steps; i += 1) {
    await page.keyboard.press('ArrowRight');
  }
};

test('picks a title for the chosen mood and time', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/pick', ({ route }) =>
    json(route, 200, pickResult(27205, 'Inception'))
  );
  await mock.install(page);

  await page.goto('/tonight');
  await expect(page.getByRole('button', { name: 'Pick for us' })).toBeVisible();

  await page.getByRole('button', { name: 'Funny' }).click();
  await nudgeMinutes(page, 6); // 90 -> 120
  await expect(page.getByText('Time available: 120 minutes')).toBeVisible();
  await page.getByRole('button', { name: 'Pick for us' }).click();

  await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible();
  await expect(page.getByText('Because Inception.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Watch on Netflix' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Watching it' })).toBeVisible();

  const pick = mock.requests.find(
    r => r.pathname === '/api/households/hh1/pick'
  );
  expect(pick?.body).toMatchObject({ mood: 'funny', minutes: 120 });
});

test('swaps to a new pick, excluding the current one and recording a swapped event', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  let calls = 0;
  mock.on('POST', '/api/households/:id/pick', ({ route }) => {
    calls += 1;
    return json(
      route,
      200,
      calls === 1
        ? pickResult(100, 'First Movie')
        : pickResult(200, 'Second Movie')
    );
  });
  mock.on('POST', '/api/households/:id/pick-events', ({ route }) =>
    json(route, 201, { recorded: true, id: 'evt1' })
  );
  await mock.install(page);

  await page.goto('/tonight');
  await page.getByRole('button', { name: 'Pick for us' }).click();
  await expect(
    page.getByRole('heading', { name: 'First Movie' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Swap' }).click();
  await expect(
    page.getByRole('heading', { name: 'Second Movie' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'First Movie' })).toBeHidden();

  const swapEvent = mock.requests.find(
    r => r.pathname === '/api/households/hh1/pick-events'
  );
  expect(swapEvent?.body).toMatchObject({ kind: 'swapped', tmdbId: 100 });

  const picks = mock.requests.filter(
    r => r.pathname === '/api/households/hh1/pick'
  );
  expect(picks.at(-1)?.body).toMatchObject({ excludeTmdbIds: [100] });
});

test('commits the pick and clears the result card', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/pick', ({ route }) =>
    json(route, 200, pickResult(100, 'First Movie'))
  );
  mock.on('POST', '/api/households/:id/picks/:tmdbId/commit', ({ route }) =>
    json(route, 201, { recorded: true, id: 'w1' })
  );
  await mock.install(page);

  await page.goto('/tonight');
  await page.getByRole('button', { name: 'Pick for us' }).click();
  await expect(
    page.getByRole('heading', { name: 'First Movie' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Watching it' }).click();
  await expect(page.getByRole('heading', { name: 'First Movie' })).toBeHidden();

  expect(
    mock.requests.some(
      r => r.pathname === '/api/households/hh1/picks/100/commit'
    )
  ).toBe(true);
});

test('launches a streaming provider from the pick card', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/pick', ({ route }) =>
    json(route, 200, pickResult(100, 'First Movie'))
  );
  mock.on('POST', '/api/households/:id/picks/:tmdbId/launch', ({ route }) =>
    json(route, 200, {
      url: 'about:blank',
      providerName: 'Netflix',
      region: 'GB',
    })
  );
  await mock.install(page);
  // The card opens the provider in a new tab; close whatever popup it spawns.
  page.on('popup', popup => {
    void popup.close();
  });

  await page.goto('/tonight');
  await page.getByRole('button', { name: 'Pick for us' }).click();
  await page.getByRole('button', { name: 'Watch on Netflix' }).click();

  await expect
    .poll(() =>
      mock.requests.some(
        r => r.pathname === '/api/households/hh1/picks/100/launch'
      )
    )
    .toBe(true);
  const launch = mock.requests.find(
    r => r.pathname === '/api/households/hh1/picks/100/launch'
  );
  expect(launch?.body).toMatchObject({
    providerSlug: 'Netflix',
    mediaType: 'movie',
  });
});
