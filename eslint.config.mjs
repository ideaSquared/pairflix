// Monorepo-wide ESLint Flat Config for ESLint v9+
// Covers Node/TS (backend), React/TS (client/admin), and Prettier integration

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Helper to detect React projects (client/admin)
 */
const isReact = filePath =>
  /app\.client|app\.admin|lib\.components/.test(filePath);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './tsconfig.json',
          './backend/tsconfig.json',
          './app.client/tsconfig.json',
          './app.admin/tsconfig.json',
          './lib.components/tsconfig.json',
        ],
        sourceType: 'module',
        ecmaVersion: 2021,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Common TypeScript rules from backend/app.client
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // React/Frontend overrides
  {
    files: [
      'app.client/**/*.{ts,tsx}',
      'app.admin/**/*.{ts,tsx}',
      'lib.components/**/*.{ts,tsx}',
    ],
    plugins: {
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Prettier integration (all packages)
  {
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'error',
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
  },
  // Node/Backend specific (backend only)
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      env: {
        node: true,
        jest: true,
      },
    },
  },
  // Frontend env (client/admin/components)
  {
    files: [
      'app.client/**/*.{ts,tsx}',
      'app.admin/**/*.{ts,tsx}',
      'lib.components/**/*.{ts,tsx}',
    ],
    languageOptions: {
      env: {
        browser: true,
        es2021: true,
      },
    },
  },
];
