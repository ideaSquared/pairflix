import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint flat config shared by every Pairflix workspace, ported from
 * the creatorgrid sibling repo's shared-package pattern.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/__tests__/**',
      '**/*.config.{ts,js,mjs}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    // Plain .js files in this codebase are CommonJS tooling (eslint configs,
    // scripts) rather than browser/ESM code.
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
  },
  { ignores: ['node_modules', 'dist', 'build', 'coverage', '**/*.d.ts'] }
);
