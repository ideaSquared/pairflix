import { expect, test } from '@playwright/test';
import { json, seedAuthedSession } from './support/authed-api-mock';

test('surfaces the quota error when a free-tier pick is refused', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/pick', ({ route }) =>
    json(route, 402, {
      error: 'pick_quota_exceeded',
      upgradeUrl: '/billing/mock-checkout',
      entitlements: { tier: 'free', picksRemaining: 0 },
    })
  );
  await mock.install(page);

  await page.goto('/tonight');
  await page.getByRole('button', { name: 'Pick for us' }).click();

  await expect(page.getByText('pick_quota_exceeded')).toBeVisible();
});

test('shows the upgrade banner at zero picks and routes to checkout', async ({
  page,
}) => {
  const mock = seedAuthedSession({
    entitlements: { picksRemaining: 0, picksUsedToday: 3 },
  });
  await mock.install(page);

  await page.goto('/tonight');
  await expect(page.getByText(/No picks left today/)).toBeVisible();

  await page.getByRole('button', { name: 'Upgrade' }).click();
  await expect(page).toHaveURL('/billing/mock-checkout?household=hh1');
});

test('activates the mock upgrade and returns to the pick screen', async ({
  page,
}) => {
  const mock = seedAuthedSession();
  mock.on('POST', '/api/households/:id/billing/mock-activate', ({ route }) =>
    json(route, 200, { ok: true })
  );
  await mock.install(page);

  await page.goto('/billing/mock-checkout?household=hh1');
  await expect(
    page.getByRole('heading', { name: 'Upgrade to Premium' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Pay £4.99 / month' }).click();

  await expect(page).toHaveURL('/tonight');
  expect(
    mock.requests.some(
      r => r.pathname === '/api/households/hh1/billing/mock-activate'
    )
  ).toBe(true);
});
