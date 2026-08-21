/// <reference types="vite/client" />
import { useMemo } from 'react';

declare const process:
  | {
      env: {
        NODE_ENV?: string;
        VITE_AFFILIATE_PARAMS?: string;
      };
    }
  | undefined;

// Mirrors billing/flags.ts: read the Vite-injected import.meta.env literal (statically replaced at
// build time), but in tests drive it via process.env, which Vitest populates and marks with
// NODE_ENV === 'test'. Reading import.meta.env directly is the only form Vite replaces -- a dynamic
// globalThis.import lookup never resolves.
const readRaw = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return process.env.VITE_AFFILIATE_PARAMS;
  }
  const raw = import.meta.env.VITE_AFFILIATE_PARAMS;
  return typeof raw === 'string' ? raw : undefined;
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
