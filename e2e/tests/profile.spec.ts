import { expect, test } from '@playwright/test';
import { json, seedAuthedSession } from './support/authed-api-mock';

test('updates the username', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('PATCH', '/api/me/username', ({ route }) =>
    json(route, 200, { data: { id: 'u1', username: 'newname' } })
  );
  await mock.install(page);

  await page.goto('/profile');
  const form = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Update Username' }) });
  await form.getByPlaceholder('New Username').fill('newname');
  await form.getByRole('button', { name: 'Update Username' }).click();

  await expect(page.getByText('Username updated successfully')).toBeVisible();
  const req = mock.requests.find(r => r.pathname === '/api/me/username');
  expect(req?.method).toBe('PATCH');
  expect(req?.body).toMatchObject({ username: 'newname' });
});

test('updates the password', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/me/password', ({ route }) =>
    route.fulfill({ status: 204 })
  );
  await mock.install(page);

  await page.goto('/profile');
  const form = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Update Password' }) });
  await form.getByPlaceholder('Current Password').fill('Str0ngPass123');
  await form
    .getByPlaceholder('New Password', { exact: true })
    .fill('NewPass123');
  await form.getByPlaceholder('Confirm New Password').fill('NewPass123');
  await form.getByRole('button', { name: 'Update Password' }).click();

  await expect(page.getByText('Password updated successfully')).toBeVisible();
  expect(mock.requests.some(r => r.pathname === '/api/me/password')).toBe(true);
});

test('rejects a new password that fails the policy', async ({ page }) => {
  const mock = seedAuthedSession();
  await mock.install(page);

  await page.goto('/profile');
  const form = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Update Password' }) });
  await form.getByPlaceholder('Current Password').fill('Str0ngPass123');
  // Passes length + uppercase + number but has no lowercase -- and that message, unlike the
  // length/uppercase/number ones, is not in the static helper text, so it matches uniquely.
  await form
    .getByPlaceholder('New Password', { exact: true })
    .fill('PASSWORD1');
  await form.getByPlaceholder('Confirm New Password').fill('PASSWORD1');
  await form.getByRole('button', { name: 'Update Password' }).click();

  await expect(
    page.getByText('Password must contain at least one lowercase letter')
  ).toBeVisible();
  expect(mock.requests.some(r => r.pathname === '/api/me/password')).toBe(
    false
  );
});

test('updates the theme preference', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('PATCH', '/api/me/preferences', ({ route }) =>
    json(route, 200, { data: { preferences: { theme: 'light' } } })
  );
  await mock.install(page);

  await page.goto('/profile');
  const themeSelect = page
    .getByRole('combobox')
    .filter({ has: page.getByRole('option', { name: 'Dark Theme' }) });
  await themeSelect.selectOption('light');

  await expect(
    page.getByText('Preferences updated successfully')
  ).toBeVisible();
  const req = mock.requests.find(r => r.pathname === '/api/me/preferences');
  expect(req?.body).toMatchObject({ preferences: { theme: 'light' } });
});
