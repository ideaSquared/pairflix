import { act, renderHook } from '@testing-library/react';
import type { UIEvent } from 'react';
import { useDebounced, useVirtualized } from './useVirtualized';

const buildItems = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => `item-${i}`);

// The hook only reads event.currentTarget.scrollTop, so a minimal shape is enough.
const scrollEvent = (scrollTop: number): UIEvent<HTMLElement> =>
  ({ currentTarget: { scrollTop } }) as unknown as UIEvent<HTMLElement>;

describe('useVirtualized', () => {
  it('computes the initial window with overscan from scrollTop 0', () => {
    const items = buildItems(100);
    const { result } = renderHook(() =>
      useVirtualized(items, { itemHeight: 10, containerHeight: 100 })
    );

    // ceil(100 / 10) = 10 rows in view; default overscan 5 -> indices 0..15.
    expect(result.current.visibleItems).toHaveLength(16);
    expect(result.current.visibleItems[0]?.virtualProps.index).toBe(0);
    expect(result.current.visibleItems[0]?.item).toBe('item-0');
    expect(result.current.visibleItems.at(-1)?.virtualProps.index).toBe(15);
    expect(result.current.totalHeight).toBe(1000);
  });

  it('positions each virtual item absolutely at index * itemHeight', () => {
    const items = buildItems(100);
    const { result } = renderHook(() =>
      useVirtualized(items, { itemHeight: 20, containerHeight: 100 })
    );

    expect(result.current.visibleItems[0]?.virtualProps.style).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 20,
    });
    expect(result.current.visibleItems[2]?.virtualProps.style.top).toBe(40);
  });

  it('shifts the window when handleScroll updates scrollTop', () => {
    const items = buildItems(100);
    const { result } = renderHook(() =>
      useVirtualized(items, { itemHeight: 10, containerHeight: 100 })
    );

    act(() => {
      result.current.handleScroll(scrollEvent(300));
    });

    // scrollTop 300 -> visibleStart 30, visibleEnd 40; overscan 5 -> 25..45.
    expect(result.current.visibleItems).toHaveLength(21);
    expect(result.current.visibleItems[0]?.virtualProps.index).toBe(25);
    expect(result.current.visibleItems[0]?.item).toBe('item-25');
    expect(result.current.visibleItems[0]?.virtualProps.style.top).toBe(250);
    expect(result.current.visibleItems.at(-1)?.virtualProps.index).toBe(45);
  });

  it('respects a custom overscan of 0', () => {
    const items = buildItems(100);
    const { result } = renderHook(() =>
      useVirtualized(items, {
        itemHeight: 10,
        containerHeight: 100,
        overscan: 0,
      })
    );

    // No overscan padding -> indices 0..10 (11 rows).
    expect(result.current.visibleItems).toHaveLength(11);
    expect(result.current.visibleItems[0]?.virtualProps.index).toBe(0);
    expect(result.current.visibleItems.at(-1)?.virtualProps.index).toBe(10);
  });

  it('clamps the window to the item count for short lists', () => {
    const items = buildItems(3);
    const { result } = renderHook(() =>
      useVirtualized(items, { itemHeight: 10, containerHeight: 100 })
    );

    expect(result.current.visibleItems).toHaveLength(3);
    expect(result.current.visibleItems.map(v => v.item)).toEqual([
      'item-0',
      'item-1',
      'item-2',
    ]);
    expect(result.current.totalHeight).toBe(30);
  });

  it('exposes container and content props for the scroll viewport', () => {
    const items = buildItems(10);
    const { result } = renderHook(() =>
      useVirtualized(items, { itemHeight: 25, containerHeight: 200 })
    );

    expect(result.current.containerProps.style).toMatchObject({
      height: 200,
      overflow: 'auto',
      position: 'relative',
    });
    expect(result.current.containerProps.onScroll).toBe(
      result.current.handleScroll
    );
    expect(result.current.contentProps.style).toMatchObject({
      height: 250,
      position: 'relative',
    });
  });
});

describe('useDebounced', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounced('a', 500));
    expect(result.current).toBe('a');
  });

  it('updates to the new value only after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounced(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('debounces rapid changes and emits only the final value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounced(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // 'b' was superseded before its 500ms elapsed; 'c' has only waited 300ms.
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('c');
  });

  it('clears the pending timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounced(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // The cleanup cleared the timer, so the last observed value stays 'a'.
    expect(result.current).toBe('a');
  });
});
