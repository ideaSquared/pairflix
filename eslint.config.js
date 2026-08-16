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
      'services/api/.sequelizerc',
      'services/api/src/db/config.js',
      'services/api/src/db/migrations/*.js',
    ],
  },
];
