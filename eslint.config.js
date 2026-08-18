import baseConfig from '@pairflix/eslint-config-base';

export default [
  ...baseConfig,
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
