// Jest configuration for lib.components
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	// Indicates this is a TypeScript project
	preset: 'ts-jest',

	// Use jsdom for testing React components
	testEnvironment: 'jsdom',

	// Configure setup files to extend Jest with testing library
	setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],

	// Handle non-TypeScript files and mocks
	moduleNameMapper: {
		// Handle image imports
		'\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.ts',

		// Handle CSS imports (with CSS modules)
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},

	// Ignore test files in these directories
	testPathIgnorePatterns: ['/node_modules/', '/dist'],

	// Configure the TypeScript transformation
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				isolatedModules: true,
			},
		],
	},

	// Specify test file patterns
	testMatch: ['**/?(*.)+(spec|test).ts?(x)'],

	// Specify file extensions for imports
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

	// Configure code coverage collection
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*.stories.{ts,tsx}',
		'!src/**/index.{ts,tsx}',
		'!src/**/__tests__/**',
		'!src/**/__mocks__/**',
	],

	// Configure global coverage thresholds
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
};

export default config;
