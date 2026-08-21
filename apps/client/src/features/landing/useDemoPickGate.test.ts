import { act, renderHook } from '../../tests/setup';
import { useDemoPickGate } from './useDemoPickGate';

const STORAGE_KEY = 'pairflix.demoPickUsedAt';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-08-21T12:00:00.000Z').getTime();

describe('useDemoPickGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports not-used when nothing is stored', () => {
    const { result } = renderHook(() => useDemoPickGate());

    expect(result.current.hasUsedToday).toBe(false);
  });

  it('reports used when the stored timestamp is within the 24h cooldown window', () => {
    localStorage.setItem(STORAGE_KEY, String(NOW - 60 * 60 * 1000));

    const { result } = renderHook(() => useDemoPickGate());

    expect(result.current.hasUsedToday).toBe(true);
  });

  it('reports not-used once the stored timestamp is older than the cooldown window', () => {
    localStorage.setItem(STORAGE_KEY, String(NOW - COOLDOWN_MS - 1));

    const { result } = renderHook(() => useDemoPickGate());

    expect(result.current.hasUsedToday).toBe(false);
  });

  it('treats the exact cooldown boundary as expired', () => {
    localStorage.setItem(STORAGE_KEY, String(NOW - COOLDOWN_MS));

    const { result } = renderHook(() => useDemoPickGate());

    // The window is exclusive: Date.now() - usedAt < COOLDOWN_MS is false at exactly 24h.
    expect(result.current.hasUsedToday).toBe(false);
  });

  it('markUsed persists the current timestamp and flips hasUsedToday to true', () => {
    const { result } = renderHook(() => useDemoPickGate());
    expect(result.current.hasUsedToday).toBe(false);

    act(() => {
      result.current.markUsed();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(NOW));
    expect(result.current.hasUsedToday).toBe(true);
  });
});
