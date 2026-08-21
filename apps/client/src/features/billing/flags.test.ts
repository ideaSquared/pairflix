import { isBillingMockEnabled } from './flags';

// In the Vitest/jsdom runtime `process` is defined and NODE_ENV is 'test', so isBillingMockEnabled
// reads the flag from process.env (which vi.stubEnv populates), first VITE_BILLING_MOCK_ENABLED then
// the NODE_ENV production fallback. A real browser build reads the same flag from the Vite-injected
// import.meta.env literal instead (see flags.ts).
describe('isBillingMockEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is enabled when VITE_BILLING_MOCK_ENABLED is exactly "true"', () => {
    vi.stubEnv('VITE_BILLING_MOCK_ENABLED', 'true');

    expect(isBillingMockEnabled()).toBe(true);
  });

  it('is disabled when VITE_BILLING_MOCK_ENABLED is "false"', () => {
    vi.stubEnv('VITE_BILLING_MOCK_ENABLED', 'false');

    expect(isBillingMockEnabled()).toBe(false);
  });

  it('treats any value other than "true" as disabled', () => {
    vi.stubEnv('VITE_BILLING_MOCK_ENABLED', '1');

    expect(isBillingMockEnabled()).toBe(false);
  });

  it('falls back to enabled outside production when the flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(isBillingMockEnabled()).toBe(true);
  });

  it('falls back to disabled in production when the flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(isBillingMockEnabled()).toBe(false);
  });

  it('lets the explicit flag win over the NODE_ENV fallback', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITE_BILLING_MOCK_ENABLED', 'true');

    expect(isBillingMockEnabled()).toBe(true);
  });
});
