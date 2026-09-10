import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Mock } from 'vitest';
import { households } from '../../services/api/households';
import { act, renderHook, waitFor } from '../../tests/setup';
import { useTonightPick } from './useTonightPick';

// The service submodule is imported directly (not via the aliased `services/api` index), so it
// needs its own vi.mock -- see TonightPicker.test.tsx's identical setup.
vi.mock('../../services/api/households', () => ({
  households: {
    pick: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return { wrapper: Wrapper, queryClient };
};

describe('useTonightPick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.pick as Mock).mockResolvedValue({
      pick: { tmdbId: 1, mediaType: 'movie' },
      alternates: [],
      rationale: 'because',
      score: 1,
    });
  });

  it('invalidates the entitlements query for this household on a successful pick', async () => {
    const { wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(['entitlements', 'household-1'], {
      tier: 'free',
      picksRemaining: 1,
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useTonightPick({ householdId: 'household-1' }),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({ mood: 'feelgood', minutes: 90 });
    });

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['entitlements', 'household-1'],
      })
    );
    expect(households.pick).toHaveBeenCalledWith('household-1', {
      mood: 'feelgood',
      minutes: 90,
    });
  });
});
