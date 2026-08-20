import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import {
  render,
  type RenderOptions,
  type RenderResult,
  screen,
  waitFor,
  within,
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

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { screen, waitFor, within };

// Import and explicitly re-export commonly used utilities that might not be caught by the wildcard export

export { customRender as render };
