import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PairflixComponents',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'styled-components',
        '@tanstack/react-query',
        'react-router-dom'
      ],
      output: [
        {
          format: 'es',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'styled-components': 'styled',
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
