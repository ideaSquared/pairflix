import { useMemo } from 'react';

declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_AFFILIATE_PARAMS?: string;
      };
    }
  | undefined;

const readRaw = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return undefined;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importMeta = (globalThis as any).import?.meta;
    return importMeta?.env?.VITE_AFFILIATE_PARAMS;
  } catch {
    return undefined;
  }
};

const parse = (raw: string | undefined): Record<string, string> => {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string') {
          out[key] = value;
        }
      }
      return out;
    }
  } catch {
    return {};
  }
  return {};
};

export function useAffiliateParams(): Record<string, string> {
  return useMemo(() => parse(readRaw()), []);
}
