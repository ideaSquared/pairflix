import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Mock } from 'vitest';
import { billing } from '../services/api';
import { renderHook, waitFor } from '../tests/setup';
import { useEntitlements } from './useEntitlements';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useEntitlements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (billing.getEntitlements as Mock).mockResolvedValue({
      tier: 'free',
      dailyPickLimit: 1,
      picksUsedToday: 0,
      picksRemaining: 1,
      canUseLlmRerank: false,
      canUseMultiRegion: false,
      regionLock: null,
    });
  });

  it('stays idle and does not fetch when no householdId is provided', () => {
    const { result } = renderHook(() => useEntitlements(undefined), {
      wrapper: createWrapper(),
    });

    expect(billing.getEntitlements).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('fetches entitlements for the given householdId', async () => {
    const { result } = renderHook(() => useEntitlements('household-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(billing.getEntitlements).toHaveBeenCalledWith('household-1');
    expect(result.current.data).toEqual(
      expect.objectContaining({ tier: 'free', picksRemaining: 1 })
    );
  });
});
