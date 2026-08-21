import { expect, test } from '@playwright/test';
import { json, seedLoggedOut } from './support/authed-api-mock';

// The registration journey: client-side validation and the post-signup "check your email" screen.

test('surfaces a client-side validation error for mismatched passwords', async ({
  page,
}) => {
  await seedLoggedOut().install(page);

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

test('succeeds and shows the check-your-email screen', async ({ page }) => {
  const mock = seedLoggedOut();
  mock.on('POST', '/api/auth/register', ({ route }) =>
    json(route, 201, {
      data: { id: 'user_e2e', username: 'e2euser', email: 'e2e@example.com' },
    })
  );
  await mock.install(page);

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
