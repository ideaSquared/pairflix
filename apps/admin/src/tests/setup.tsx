// react-router-dom needs TextEncoder/TextDecoder, which jsdom doesn't provide
import { TextDecoder, TextEncoder } from 'node:util';
Object.assign(global, { TextEncoder, TextDecoder });

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ThemeProvider } from '../styles/ThemeProvider';

// Mock window.matchMedia which is not available in jsdom
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };

// Create a fresh query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Custom render function that includes all providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
