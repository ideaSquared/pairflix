import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pairflix/components': path.resolve(
        __dirname,
        '../../packages/lib.components/src'
      ),
    },
  },
  optimizeDeps: {
    include: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
  },
  server: {
    port: 5174, // Using a different port than the main frontend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: true,
      timeout: 30000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
