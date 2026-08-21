import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Mock } from 'vitest';
import { households } from '../../services/api';
import type { HouseholdSummary } from '../../services/api/households';
import { renderHook, waitFor } from '../../tests/setup';
import { usePrimaryHousehold } from './usePrimaryHousehold';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

const makeHousehold = (id: string): HouseholdSummary => ({
  id,
  name: `Household ${id}`,
  role: 'member',
  joinedAt: '2026-01-01T00:00:00.000Z',
  memberCount: 2,
});

describe('usePrimaryHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.list as Mock).mockResolvedValue({ households: [] });
  });

  it('exposes the first household from the shared households query as data', async () => {
    const list = [makeHousehold('h1'), makeHousehold('h2')];
    (households.list as Mock).mockResolvedValue({ households: list });

    const { result } = renderHook(() => usePrimaryHousehold(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(households.list).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(list[0]);
  });

  it('exposes null data when the household list is empty', async () => {
    (households.list as Mock).mockResolvedValue({ households: [] });

    const { result } = renderHook(() => usePrimaryHousehold(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('exposes null data before the query resolves', () => {
    (households.list as Mock).mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => usePrimaryHousehold(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });
});
