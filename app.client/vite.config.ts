import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
		watch: {
			usePolling: true,
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@pairflix/components': path.resolve(__dirname, '../lib.components/src'),
		},
	},
});
