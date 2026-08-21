import { expect, test } from '@playwright/test';
import { installApiMock, json } from './support/api-mock';

const pick = {
  tmdbId: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  year: 1999,
  runtime: 139,
  overview:
    'An insomniac office worker and a soap maker form an underground club.',
  posterPath: null,
  providers: {
    flatrate: [
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' },
    ],
  },
};

const result = {
  pick,
  alternates: [],
  rationale: 'A sharp, twisty pick for your feel-good mood.',
  score: 0.92,
};

test('runs the anonymous demo pick and shows the recommended title', async ({
  page,
}) => {
  await installApiMock(page, {
    'POST /api/demo/pick': route => json(route, 200, result),
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Show me a pick' }).click();

  await expect(page.getByRole('heading', { name: 'Fight Club' })).toBeVisible();
  await expect(
    page.getByText('A sharp, twisty pick for your feel-good mood.')
  ).toBeVisible();
  await expect(page.getByText('Netflix', { exact: true })).toBeVisible();
  // Anonymous visitors are nudged to sign up from the result card.
  await expect(
    page.getByRole('button', { name: 'Create a free account' })
  ).toBeVisible();
});

test('surfaces the API error message when the demo pick fails', async ({
  page,
}) => {
  await installApiMock(page, {
    'POST /api/demo/pick': route =>
      json(route, 404, {
        error: 'No matching titles found. Try another mood.',
      }),
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Show me a pick' }).click();

  await expect(
    page.getByText('No matching titles found. Try another mood.')
  ).toBeVisible();
});
