declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_BILLING_MOCK_ENABLED?: string;
      };
    }
  | undefined;

const getViteEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return undefined;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importMeta = (globalThis as any).import?.meta;
    return importMeta?.env?.[key];
  } catch {
    return undefined;
  }
};

export const isBillingMockEnabled = (): boolean => {
  const fromEnv =
    getViteEnvVar('VITE_BILLING_MOCK_ENABLED') ??
    (typeof process !== 'undefined'
      ? process.env?.VITE_BILLING_MOCK_ENABLED
      : undefined);
  if (fromEnv !== undefined) {
    return fromEnv === 'true';
  }
  if (typeof process !== 'undefined') {
    return process.env?.NODE_ENV !== 'production';
  }
  return true;
};
