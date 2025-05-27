/**
 * Mock module for import.meta.env used by Vite
 * This will be used by Jest's moduleNameMapper
 */
module.exports = {
	env: {
		VITE_API_URL: 'http://localhost:3000',
		MODE: 'test',
		DEV: true,
		PROD: false,
		SSR: false,
	},
};
