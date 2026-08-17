import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/*.test.ts'],
	// The Hono Worker (P3, ADR 0001) has its own @cloudflare/vitest-pool-workers suite (see
	// vitest.config.mts) -- Jest can't provide Miniflare/D1 bindings, so it must never pick these up.
	testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/src/hono/'],
	verbose: true,
	forceExit: true,
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	setupFiles: ['<rootDir>/src/tests/setup.ts'],
};

export default config;
