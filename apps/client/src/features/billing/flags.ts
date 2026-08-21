/// <reference types="vite/client" />

declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_BILLING_MOCK_ENABLED?: string;
      };
    }
  | undefined;

// Mirrors services/api utils.ts's getApiUrl: read the Vite-injected `import.meta.env` literal (which
// the bundler statically replaces at build time), but in tests drive behaviour via process.env,
// which Vitest populates and marks with NODE_ENV === 'test'. Reading `import.meta.env` directly is
// the only form Vite replaces -- a dynamic `globalThis.import` lookup never resolves.
const getBillingMockFlag = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return process.env.VITE_BILLING_MOCK_ENABLED;
  }
  const fromVite = import.meta.env.VITE_BILLING_MOCK_ENABLED;
  return typeof fromVite === 'string' ? fromVite : undefined;
};

export const isBillingMockEnabled = (): boolean => {
  const fromEnv = getBillingMockFlag();
  if (fromEnv !== undefined) {
    return fromEnv === 'true';
  }
  if (typeof process !== 'undefined') {
    return process.env?.NODE_ENV !== 'production';
  }
  // Browser build with the flag unset: default on (pre-launch alpha, no live Stripe yet).
  return true;
};
