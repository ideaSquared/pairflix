import { expect, test } from '@playwright/test';
import { installApiMock, json } from './support/api-mock';

test.beforeEach(async ({ page }) => {
  await installApiMock(page, {
    'POST /api/auth/register': route =>
      json(route, 201, {
        data: {
          id: 'user_e2e',
          username: 'e2euser',
          email: 'e2e@example.com',
        },
      }),
  });
});

test('login page shows the sign-in form', async ({ page }) => {
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'Login to PairFlix' })
  ).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('an unauthenticated visit to a protected route redirects to login', async ({
  page,
}) => {
  await page.goto('/tonight');

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { name: 'Login to PairFlix' })
  ).toBeVisible();
});

test('register surfaces a client-side validation error for mismatched passwords', async ({
  page,
}) => {
  await page.goto('/register');

  await page.getByPlaceholder('Username').fill('e2euser');
  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page
    .getByPlaceholder('Password', { exact: true })
    .fill('Str0ngPass123');
  await page.getByPlaceholder('Confirm Password').fill('Different123');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Passwords do not match')).toBeVisible();
});

test('register succeeds and shows the check-your-email screen', async ({
  page,
}) => {
  await page.goto('/register');

  await page.getByPlaceholder('Username').fill('e2euser');
  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page
    .getByPlaceholder('Password', { exact: true })
    .fill('Str0ngPass123');
  await page.getByPlaceholder('Confirm Password').fill('Str0ngPass123');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(
    page.getByRole('heading', { name: 'Check Your Email!' })
  ).toBeVisible();
  await expect(page.getByText('e2e@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go to Login' })).toBeVisible();
});
