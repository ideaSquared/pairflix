import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/tests/setup.tsx'],
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
    // Test-only redirect to the hand-written fake in tests/__mocks__/api.ts, mirroring the old
    // Jest moduleNameMapper -- individual test files still layer their own vi.mock() overrides on
    // top of it (see tests/__mocks__/api.ts's doc comment).
    alias: [
      {
        find: /^(\.\.?\/)+services\/api$/,
        replacement: path.resolve(__dirname, './src/tests/__mocks__/api.ts'),
      },
    ],
  },
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
