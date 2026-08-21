import { expect, test } from '@playwright/test';
import { installApiMock } from './support/api-mock';

test.beforeEach(async ({ page }) => {
  await installApiMock(page);
});

test('renders the hero and demo pick form for a first-time visitor', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'What should we watch tonight?' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Show me a pick' })
  ).toBeVisible();
});

test('links through to the login page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { name: 'Login to PairFlix' })
  ).toBeVisible();
});
