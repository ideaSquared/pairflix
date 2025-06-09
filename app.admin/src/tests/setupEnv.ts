/**
 * This file sets up the environment variables and mocks for Jest tests
 */

// Set up environment variables that would normally be provided by Vite
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// We need to properly mock the global import.meta object for modules that use it
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: process.env.VITE_API_URL,
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
      },
    },
  },
  writable: false,
});
