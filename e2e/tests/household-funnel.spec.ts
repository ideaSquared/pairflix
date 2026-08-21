import { expect, test } from '@playwright/test';
import { json, seedAuthedSession } from './support/authed-api-mock';

test('creates a household and continues into taste onboarding', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households', ({ route }) =>
    json(route, 201, {
      household: {
        id: 'hh_new',
        name: 'Movie Mondays',
        role: 'owner',
        joinedAt: '2026-01-01T00:00:00.000Z',
        memberCount: 1,
      },
    })
  );
  await mock.install(page);

  await page.goto('/households/new');
  await page.getByLabel('Name (optional)').fill('Movie Mondays');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page).toHaveURL(
    '/onboarding/taste?next=%2Fhouseholds%2Fhh_new%2Finvites'
  );
  const create = mock.requests.find(r => r.pathname === '/api/households');
  expect(create?.body).toMatchObject({ name: 'Movie Mondays' });
});

test('generates a shareable invite link', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/invites', ({ route }) =>
    json(route, 201, {
      invite: {
        id: 'inv1',
        token: 'tok_abc',
        invitedEmail: null,
        expiresAt: '2026-02-01T00:00:00.000Z',
        acceptedAt: null,
      },
    })
  );
  await mock.install(page);

  await page.goto('/households/hh1/invites');
  await page.getByRole('button', { name: 'Generate invite link' }).click();

  await expect(page.getByText(/household-invites\/tok_abc/)).toBeVisible();
  expect(
    mock.requests.some(r => r.pathname === '/api/households/hh1/invites')
  ).toBe(true);
});

test('accepts a valid invite and continues into taste onboarding', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/invites/:token/accept', ({ route }) =>
    json(route, 200, { householdId: 'hh1' })
  );
  await mock.install(page);

  await page.goto('/household-invites/tok_abc');

  await expect(page).toHaveURL('/onboarding/taste?next=%2Ftonight');
  expect(
    mock.requests.some(
      r => r.pathname === '/api/households/invites/tok_abc/accept'
    )
  ).toBe(true);
});

test('shows an error for an invalid or expired invite', async ({ page }) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/invites/:token/accept', ({ route }) =>
    json(route, 410, { error: 'invite_invalid_or_expired' })
  );
  await mock.install(page);

  await page.goto('/household-invites/bad-token');

  await expect(
    page.getByText('That invite is invalid or has expired.')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create your own household' })
  ).toBeVisible();
});
