import { useEffect, useMemo, useState } from 'react';

interface VirtualizedOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizedItem {
  index: number;
  style: React.CSSProperties;
}

/**
 * Custom hook for virtual scrolling to optimize performance with large lists
 * @param items Array of items to virtualize
 * @param options Configuration options for virtualization
 * @returns Object containing visible items and virtual scroll props
 */
export const useVirtualized = <T>(items: T[], options: VirtualizedOptions) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

  const visibleItems = useMemo(() => {
    const result: { item: T; virtualProps: VirtualizedItem }[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (item !== undefined) {
        result.push({
          item,
          virtualProps: {
            index: i,
            style: {
              position: 'absolute',
              top: i * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            },
          },
        });
      }
    }

    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative' as const,
      },
      onScroll: handleScroll,
    },
    contentProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      },
    },
  };
};

/**
 * Hook for performance optimization with debounced state updates
 * @param value Initial value
 * @param delay Debounce delay in milliseconds
 * @returns Debounced value
 */
export const useDebounced = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for performance monitoring and optimization suggestions
 * @param componentName Name of the component for logging
 * @returns Performance utilities
 */
export const usePerformance = (componentName: string) => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  useEffect(() => {
    const renderTime = Date.now();
    setRenderCount(prev => prev + 1);

    if (lastRenderTime > 0) {
      const timeSinceLastRender = renderTime - lastRenderTime;

      // Warn if renders are happening too frequently (< 16ms apart, suggesting unnecessary re-renders)
      if (timeSinceLastRender < 16 && process.env.NODE_ENV === 'development') {
        console.warn(
          `${componentName}: Frequent re-renders detected (${timeSinceLastRender}ms). Consider memoization.`
        );
      }
    }

    setLastRenderTime(renderTime);
  });

  const logPerformanceMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} Performance Metrics:`, {
        renderCount,
        lastRenderTime: new Date(lastRenderTime).toISOString(),
      });
    }
  };

  return {
    renderCount,
    logPerformanceMetrics,
  };
};
