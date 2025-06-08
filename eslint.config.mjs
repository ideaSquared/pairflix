// Monorepo-wide ESLint Flat Config for ESLint v9+
// Covers Node/TS (backend), React/TS (client/admin), and Prettier integration

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // --- Industry Standard Rules ---
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-shadow': 'error',
      'no-return-await': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'dot-notation': 'error',
      // TypeScript-specific
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
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
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      // Add accessibility plugin if available
      // 'jsx-a11y': jsxA11yPlugin, // Uncomment if installed
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
      // --- React/JSX Industry Standard ---
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-key': 'error',
      'react/prop-types': 'off',
      // Accessibility (if plugin installed)
      // 'jsx-a11y/alt-text': 'warn',
      // 'jsx-a11y/anchor-is-valid': 'warn',
      // 'jsx-a11y/no-autofocus': 'warn',
    },
  },
  // Prettier integration (all packages)
  {
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'error',
    },
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Node/Backend specific (backend only)
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.jest,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
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
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
];
