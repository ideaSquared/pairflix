import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./setupTests.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PairflixComponents',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'react-router-dom',
      ],
      output: [
        {
          format: 'es',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            '@tanstack/react-query': 'ReactQuery',
            'react-router-dom': 'ReactRouterDOM',
          },
        },
        {
          format: 'cjs',
          exports: 'named',
          interop: 'auto',
        },
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
