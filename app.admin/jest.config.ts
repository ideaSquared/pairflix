import type { Config } from 'jest';

const config: Config = {
  // Indicates this is a TypeScript project
  preset: 'ts-jest',

  // Use jsdom for testing React components
  testEnvironment: 'jsdom',

  // Configure setup files - now using single consolidated setup
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.tsx'],

  // Handle non-TypeScript files and mocks
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/src/tests/__mocks__/fileMock.ts',

    // Handle Vite's import.meta.env
    'import.meta': '<rootDir>/src/tests/__mocks__/importMetaEnv.js',

    // Mock the API module
    '^../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',
    '^../../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',
    '^../../../services/api$': '<rootDir>/src/tests/__mocks__/api.ts',

    // Mock styled-components
    '^styled-components$': '<rootDir>/src/tests/__mocks__/styled-components.ts',

    // Mock the components library
    '^@pairflix/components$': '<rootDir>/src/tests/__mocks__/components.tsx',

    // Mock the useAuth hook
    '^../hooks/useAuth$': '<rootDir>/src/tests/__mocks__/useAuth.ts',
    '^../../hooks/useAuth$': '<rootDir>/src/tests/__mocks__/useAuth.ts',
    '^../../../hooks/useAuth$': '<rootDir>/src/tests/__mocks__/useAuth.ts',
  },

  // Configure the TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Specify test file patterns
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],

  // Specify file extensions for imports
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Avoid transforming node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|styled-components)/)',
    '!../lib.components/dist',
  ],
};

export default config;
