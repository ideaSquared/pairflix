import { expect, test } from '@playwright/test';
import { json, seedLoggedOut } from './support/authed-api-mock';

test.describe('email verification', () => {
  test('verifies on mount and redirects a logged-out user to login', async ({
    page,
  }) => {
    const mock = seedLoggedOut();
    mock.on('POST', '/api/auth/verify-email', ({ route }) =>
      json(route, 200, { data: { verified: true } })
    );
    await mock.install(page);

    await page.goto('/verify-email?token=good-token');

    await expect(
      page.getByRole('heading', { name: 'Email Verified!' })
    ).toBeVisible();
    const verify = mock.requests.find(
      r => r.pathname === '/api/auth/verify-email'
    );
    expect(verify?.body).toMatchObject({ token: 'good-token' });
  });

  test('reveals the resend form when the link has expired', async ({
    page,
  }) => {
    const mock = seedLoggedOut();
    mock.on('POST', '/api/auth/verify-email', ({ route }) =>
      json(route, 400, { error: 'Invalid or expired verification link' })
    );
    mock.on('POST', '/api/auth/resend-verification', ({ route }) =>
      json(route, 200, { data: { sent: true } })
    );
    await mock.install(page);

    await page.goto('/verify-email?token=expired-token');

    const emailInput = page.getByPlaceholder('Email');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('user@example.com');
    await page
      .getByRole('button', { name: 'Send New Verification Email' })
      .click();

    await expect(
      page.getByText('If that address is registered, a new link is on its way.')
    ).toBeVisible();
    const resend = mock.requests.find(
      r => r.pathname === '/api/auth/resend-verification'
    );
    expect(resend?.body).toMatchObject({ email: 'user@example.com' });
  });

  test('shows an error when the token is missing', async ({ page }) => {
    const mock = seedLoggedOut();
    await mock.install(page);

    await page.goto('/verify-email');

    await expect(
      page.getByText('Invalid or missing verification token')
    ).toBeVisible();
    expect(
      mock.requests.some(r => r.pathname === '/api/auth/verify-email')
    ).toBe(false);
  });
});

test.describe('password reset', () => {
  test('disables the form when the token is missing', async ({ page }) => {
    const mock = seedLoggedOut();
    await mock.install(page);

    await page.goto('/reset-password');

    await expect(
      page.getByText('Invalid or missing reset token')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reset Password' })
    ).toBeDisabled();
  });

  test('rejects mismatched passwords before calling the API', async ({
    page,
  }) => {
    const mock = seedLoggedOut();
    await mock.install(page);

    await page.goto('/reset-password?token=reset-token');
    await page
      .getByPlaceholder('New Password', { exact: true })
      .fill('Str0ngPass123');
    await page.getByPlaceholder('Confirm New Password').fill('Different123');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
    expect(
      mock.requests.some(r => r.pathname === '/api/auth/reset-password')
    ).toBe(false);
  });

  test('submits a valid new password', async ({ page }) => {
    const mock = seedLoggedOut();
    mock.on('POST', '/api/auth/reset-password', ({ route }) =>
      json(route, 200, { data: { id: 'u1', email: 'e2e@example.com' } })
    );
    await mock.install(page);

    await page.goto('/reset-password?token=reset-token');
    await page
      .getByPlaceholder('New Password', { exact: true })
      .fill('Str0ngPass123');
    await page.getByPlaceholder('Confirm New Password').fill('Str0ngPass123');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.getByText(/Your password has been reset/)).toBeVisible();
    const reset = mock.requests.find(
      r => r.pathname === '/api/auth/reset-password'
    );
    expect(reset?.body).toMatchObject({
      token: 'reset-token',
      password: 'Str0ngPass123',
    });
  });
});

test.describe('forgot password', () => {
  test('shows the privacy-preserving confirmation on submit', async ({
    page,
  }) => {
    const mock = seedLoggedOut();
    mock.on('POST', '/api/auth/forgot-password', ({ route }) =>
      json(route, 200, { data: { sent: true } })
    );
    await mock.install(page);

    await page.goto('/forgot-password');
    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();

    await expect(
      page.getByText(
        'If that address is registered, a reset link is on its way.'
      )
    ).toBeVisible();
    const forgot = mock.requests.find(
      r => r.pathname === '/api/auth/forgot-password'
    );
    expect(forgot?.body).toMatchObject({ email: 'user@example.com' });
  });
});
