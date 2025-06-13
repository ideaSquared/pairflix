import type { Config } from 'jest';

const config: Config = {
  // Indicates this is a TypeScript project
  preset: 'ts-jest',

  // Use jsdom for testing React components
  testEnvironment: 'jsdom',

  // Enable ES modules support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Configure setup files
  setupFiles: ['<rootDir>/src/tests/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.tsx'],

  // Define globals for import.meta
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3000',
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
      },
    },
  },

  // Handle non-TypeScript files and mocks
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/src/tests/__mocks__/fileMock.ts',

    // Handle Vite's import.meta.env
    'import\\.meta': '<rootDir>/src/tests/__mocks__/importMetaEnv.js',

    // Mock the API module to avoid import.meta.env issues
    '^../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',
    '^../../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',
    '^../../../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',
  },

  // Configure the TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },

  // Specify test file patterns
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],

  // Specify file extensions for imports
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Avoid transforming node_modules except for specific packages that use ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@testing-library|@tanstack)/)',
  ],
};

export default config;
