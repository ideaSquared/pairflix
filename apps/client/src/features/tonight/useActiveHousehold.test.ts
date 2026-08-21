import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Mock } from 'vitest';
import { households } from '../../services/api';
import type { HouseholdSummary } from '../../services/api/households';
import { renderHook, waitFor } from '../../tests/setup';
import { useActiveHousehold } from './useActiveHousehold';

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
  role: 'owner',
  joinedAt: '2026-01-01T00:00:00.000Z',
  memberCount: 2,
});

describe('useActiveHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.list as Mock).mockResolvedValue({ households: [] });
  });

  it('selects the first household as the active one and exposes the full list', async () => {
    const list = [makeHousehold('h1'), makeHousehold('h2')];
    (households.list as Mock).mockResolvedValue({ households: list });

    const { result } = renderHook(() => useActiveHousehold(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(households.list).toHaveBeenCalledTimes(1);
    expect(result.current.household).toEqual(list[0]);
    expect(result.current.households).toEqual(list);
    expect(result.current.isError).toBe(false);
  });

  it('returns a null active household when the list is empty', async () => {
    (households.list as Mock).mockResolvedValue({ households: [] });

    const { result } = renderHook(() => useActiveHousehold(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.household).toBeNull();
    expect(result.current.households).toEqual([]);
  });

  it('surfaces the error and falls back to an empty selection when the request fails', async () => {
    (households.list as Mock).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useActiveHousehold(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.household).toBeNull();
    expect(result.current.households).toEqual([]);
  });
});
