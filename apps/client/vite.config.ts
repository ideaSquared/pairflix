import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      // Same-origin in dev so the session/CSRF cookies (SameSite=Lax) reach the Worker --
      // see services/api/.dev.vars.example's ALLOWED_ORIGINS comment.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pairflix/components': path.resolve(
        __dirname,
        '../../packages/lib.components/src'
      ),
    },
  },
});
