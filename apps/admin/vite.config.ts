import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
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
    // Test-only redirects, mirroring the old Jest moduleNameMapper -- individual test files can
    // still layer their own vi.mock() overrides on top (see tests/__mocks__/*.ts doc comments).
    alias: [
      {
        find: /^(\.\.?\/)+services\/api$/,
        replacement: path.resolve(__dirname, './src/tests/__mocks__/api.ts'),
      },
      {
        find: /^(\.\.?\/)+hooks\/useAuth$/,
        replacement: path.resolve(
          __dirname,
          './src/tests/__mocks__/useAuth.ts'
        ),
      },
      {
        find: '@pairflix/components',
        replacement: path.resolve(
          __dirname,
          './src/tests/__mocks__/components.tsx'
        ),
      },
    ],
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
  optimizeDeps: {
    include: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
  },
  server: {
    port: 5174, // Using a different port than the main frontend
    proxy: {
      // Same-origin in dev so the session/CSRF cookies (SameSite=Lax) reach the Worker --
      // see services/api/.dev.vars.example's ALLOWED_ORIGINS comment.
      '/api': {
        target: 'http://localhost:8787',
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
