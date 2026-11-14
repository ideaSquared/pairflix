import baseConfig from '@pairflix/eslint-config-base';

export default [
  ...baseConfig,
  {
    files: ['services/api/src/**/*.ts'],
    ignores: ['**/*.{test,spec}.ts', '**/__tests__/**'],
    rules: { 'no-console': 'error' },
  },
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.turbo',
      '**/*.d.ts',
    ],
  },
];
