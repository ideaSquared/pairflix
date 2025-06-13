/**
 * This file sets up the environment variables and mocks for Jest tests
 */

// Set up environment variables that would normally be provided by Vite
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Polyfill for TextEncoder and TextDecoder (needed for modern browser APIs)
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock import.meta for Jest environment
const importMeta = {
  env: {
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

// Safely define import.meta globally for Jest
try {
  if (!(globalThis as typeof globalThis & { import?: unknown }).import) {
    Object.defineProperty(globalThis, 'import', {
      value: {
        meta: importMeta,
      },
      writable: false,
      configurable: true,
    });
  }
} catch {
  // If it fails, try a different approach
  (globalThis as typeof globalThis & { import: unknown }).import = {
    meta: importMeta,
  };
}
