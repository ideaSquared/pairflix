import { expect, test } from '@playwright/test';
import {
  json,
  seedAuthedSession,
  seedLoggedOut,
} from './support/authed-api-mock';

// The client has no TOTP/2FA challenge UI (LoginPage only collects email + password), so this
// covers the plain email/password login journey.
test('logs in and lands on the tonight screen', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/auth/login', ({ route }) =>
    json(route, 200, {
      data: { id: 'u1', username: 'e2euser', email: 'e2e@example.com' },
    })
  );
  await mock.install(page);

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page.getByPlaceholder('Password').fill('Str0ngPass123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/tonight');
  const login = mock.requests.find(r => r.pathname === '/api/auth/login');
  expect(login?.body).toMatchObject({
    email: 'e2e@example.com',
    password: 'Str0ngPass123',
  });
});

test('surfaces the server error on a bad login', async ({ page }) => {
  const mock = seedLoggedOut();
  mock.on('POST', '/api/auth/login', ({ route }) =>
    json(route, 401, { error: 'Invalid email or password' })
  );
  await mock.install(page);

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await expect(page).toHaveURL('/login');
});
