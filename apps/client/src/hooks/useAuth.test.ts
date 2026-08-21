import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { Mock } from 'vitest';
import { auth } from '../services/api';
import { act, renderHook, waitFor } from '../tests/setup';
import { useAuth } from './useAuth';

// useAuth is evaluated by the test setup file (setup.tsx -> ThemeProvider -> useAuth) before any
// vi.mock in this file can register, so its react-router/react-query bindings are the real ones and
// cannot be swapped out. The hook is therefore exercised against a real MemoryRouter + QueryClient,
// and navigation is asserted through the resulting location rather than a mocked useNavigate.
const locationProbe = { path: '' };
const LocationProbe = () => {
  locationProbe.path = useLocation().pathname;
  return null;
};
LocationProbe.displayName = 'LocationProbe';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
        createElement(LocationProbe)
      )
    );
  Wrapper.displayName = 'RouterQueryWrapper';
  return { wrapper: Wrapper, queryClient };
};

const firstCallOrder = (spy: {
  mock: { invocationCallOrder: number[] };
}): number => {
  const [order] = spy.mock.invocationCallOrder;
  if (order === undefined) {
    throw new Error('expected the mock to have been called at least once');
  }
  return order;
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationProbe.path = '';
  });

  it('does not retry a failed auth check when the error is Authentication required', async () => {
    (auth.getCurrentUser as Mock).mockRejectedValue(
      new Error('Authentication required')
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(auth.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('retries other auth-check errors until failureCount reaches 3, then stops', async () => {
    (auth.getCurrentUser as Mock).mockRejectedValue(new Error('network down'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    // 1 initial attempt + 3 retries (failureCount 0, 1, 2 all pass the < 3 predicate).
    await waitFor(() => expect(result.current.error).toBeTruthy(), {
      timeout: 2000,
    });
    expect(auth.getCurrentUser).toHaveBeenCalledTimes(4);
  });

  it('logs out via the API, clears the auth cache, invalidates queries and navigates to /login', async () => {
    (auth.getCurrentUser as Mock).mockReturnValue(new Promise(() => undefined));

    const { wrapper, queryClient } = createWrapper();
    const setQueryData = vi.spyOn(queryClient, 'setQueryData');
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(setQueryData).toHaveBeenCalledWith(['auth'], null);
    expect(invalidateQueries).toHaveBeenCalled();
    await waitFor(() => expect(locationProbe.path).toBe('/login'));

    // The server-side logout is awaited before the local cache is cleared.
    expect(firstCallOrder(auth.logout as Mock)).toBeLessThan(
      firstCallOrder(setQueryData)
    );
  });

  it('debounces checkAuth so rapid calls collapse into a single auth invalidation after 300ms', () => {
    (auth.getCurrentUser as Mock).mockReturnValue(new Promise(() => undefined));
    vi.useFakeTimers();
    try {
      const { wrapper, queryClient } = createWrapper();
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.checkAuth();
        result.current.checkAuth();
        result.current.checkAuth();
      });

      expect(invalidateQueries).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(invalidateQueries).toHaveBeenCalledTimes(1);
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth'] });
    } finally {
      vi.useRealTimers();
    }
  });
});
