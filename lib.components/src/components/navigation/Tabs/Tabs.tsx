import * as React from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

// Types
export interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
  registerTab: (id: string, disabled?: boolean) => void;
  unregisterTab: (id: string) => void;
  getTabProps: (id: string) => {
    role: string;
    id: string;
    'aria-controls': string;
    'aria-selected': boolean;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  getPanelProps: (id: string) => {
    role: string;
    id: string;
    'aria-labelledby': string;
    hidden: boolean;
  };
  vertical?: boolean;
}

export interface TabsProps extends BaseComponentProps {
  /**
   * Default selected tab (uncontrolled)
   */
  defaultValue?: string;

  /**
   * Selected tab (controlled)
   */
  value?: string;

  /**
   * Called when selected tab changes
   */
  onChange?: (value: string) => void;

  /**
   * Render tabs vertically
   * @default false
   */
  vertical?: boolean;

  /**
   * Children must be Tab and TabPanel components
   */
  children: React.ReactNode;
}

export interface TabProps extends BaseComponentProps {
  /**
   * Value used to identify the tab
   */
  value: string;

  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Children can be string or element
   */
  children: React.ReactNode;

  /**
   * Internal prop for vertical layout styling
   * @internal
   */
  $vertical?: boolean;
}

export interface TabPanelProps extends BaseComponentProps {
  /**
   * Value that matches the associated tab
   */
  value: string;

  /**
   * Panel content
   */
  children: React.ReactNode;
}

// Context
const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

// Styled Components
const TabsContainer = styled.div<{ $vertical?: boolean }>`
  display: flex;
  flex-direction: ${({ $vertical }) => ($vertical ? 'row' : 'column')};
  width: 100%;
`;

const StyledTabList = styled.div<{ $vertical?: boolean }>`
  display: flex;
  flex-direction: ${({ $vertical }) => ($vertical ? 'column' : 'row')};
  border-bottom: ${({ $vertical, theme }) =>
    $vertical
      ? 'none'
      : `1px solid ${theme?.colors?.border?.default || '#e0e0e0'}`};
  border-right: ${({ $vertical, theme }) =>
    $vertical
      ? `1px solid ${theme?.colors?.border?.default || '#e0e0e0'}`
      : 'none'};
  gap: ${({ theme }) => theme?.spacing?.sm || '8px'};
`;

const TabButton = styled.button<{ $selected?: boolean; $vertical?: boolean }>`
  padding: ${({ theme }) => theme?.spacing?.sm || '8px'}
    ${({ theme }) => theme?.spacing?.md || '16px'};
  border: none;
  background: none;
  color: ${({ $selected, theme }) =>
    $selected
      ? theme?.colors?.primary || '#0077cc'
      : theme?.colors?.text?.primary || '#000000'};
  cursor: pointer;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '16px'};
  border-bottom: ${({ $selected, $vertical, theme }) =>
    !$vertical && $selected
      ? `2px solid ${theme?.colors?.primary || '#0077cc'}`
      : 'none'};
  border-right: ${({ $selected, $vertical, theme }) =>
    $vertical && $selected
      ? `2px solid ${theme?.colors?.primary || '#0077cc'}`
      : 'none'};
  margin-bottom: ${({ $vertical }) => ($vertical ? '0' : '-1px')};
  margin-right: ${({ $vertical }) => ($vertical ? '-1px' : '0')};
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme?.colors?.primary || '#0077cc'};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#0077cc'};
    outline-offset: -2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TabPanelContainer = styled.div<{ $vertical?: boolean }>`
  padding: ${({ theme }) => theme?.spacing?.md || '16px'};
  flex: 1;
`;

// Components
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue,
      value: controlledValue,
      onChange,
      vertical = false,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const [selectedTab, setSelectedTabState] = useState(defaultValue || '');
    const tabsRef = useRef(new Map<string, boolean>());
    const idPrefix = useId();

    const setSelectedTab = useCallback(
      (id: string) => {
        if (controlledValue === undefined) {
          setSelectedTabState(id);
        }
        onChange?.(id);
      },
      [controlledValue, onChange]
    );

    const registerTab = useCallback((id: string, disabled = false) => {
      tabsRef.current.set(id, disabled);
    }, []);

    const unregisterTab = useCallback((id: string) => {
      tabsRef.current.delete(id);
    }, []);

    const getTabProps = useCallback(
      (id: string) => ({
        role: 'tab',
        id: `${idPrefix}-tab-${id}`,
        'aria-controls': `${idPrefix}-panel-${id}`,
        'aria-selected': (controlledValue || selectedTab) === id,
        tabIndex: (controlledValue || selectedTab) === id ? 0 : -1,
        onClick: () => {
          if (!tabsRef.current.get(id)) {
            setSelectedTab(id);
          }
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          const tabs = Array.from(tabsRef.current.keys());
          const currentIndex = tabs.indexOf(id);

          // Find next enabled tab in a given range of indices
          const getNextEnabledTab = (indices: number[]) => {
            for (const idx of indices) {
              const tabId = tabs[idx];
              if (
                idx >= 0 &&
                idx < tabs.length &&
                tabId &&
                !tabsRef.current.get(tabId)
              ) {
                return tabId;
              }
            }
            return null;
          };

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown': {
              e.preventDefault();
              const nextIndices = [];
              // Start from the next index, then loop around if needed
              for (let i = 1; i <= tabs.length; i++) {
                const idx = (currentIndex + i) % tabs.length;
                nextIndices.push(idx);
              }
              const nextTab = getNextEnabledTab(nextIndices);
              if (nextTab) {
                setSelectedTab(nextTab);
                // Set focus to the newly selected tab
                document.getElementById(`${idPrefix}-tab-${nextTab}`)?.focus();
              }
              break;
            }
            case 'ArrowLeft':
            case 'ArrowUp': {
              e.preventDefault();
              const prevIndices = [];
              // Start from the previous index, then loop around if needed
              for (let i = 1; i <= tabs.length; i++) {
                const idx = (currentIndex - i + tabs.length) % tabs.length;
                prevIndices.push(idx);
              }
              const prevTab = getNextEnabledTab(prevIndices);
              if (prevTab) {
                setSelectedTab(prevTab);
                // Set focus to the newly selected tab
                document.getElementById(`${idPrefix}-tab-${prevTab}`)?.focus();
              }
              break;
            }
            case 'Home': {
              e.preventDefault();
              // From first to last index
              const firstTab = getNextEnabledTab(
                Array.from({ length: tabs.length }, (_, i) => i)
              );
              if (firstTab) {
                setSelectedTab(firstTab);
                // Set focus to the newly selected tab
                document.getElementById(`${idPrefix}-tab-${firstTab}`)?.focus();
              }
              break;
            }
            case 'End': {
              e.preventDefault();
              // From last to first index
              const lastTab = getNextEnabledTab(
                Array.from(
                  { length: tabs.length },
                  (_, i) => tabs.length - 1 - i
                )
              );
              if (lastTab) {
                setSelectedTab(lastTab);
                // Set focus to the newly selected tab
                document.getElementById(`${idPrefix}-tab-${lastTab}`)?.focus();
              }
              break;
            }
          }
        },
      }),
      [controlledValue, selectedTab, idPrefix, setSelectedTab]
    );

    const getPanelProps = useCallback(
      (id: string) => ({
        role: 'tabpanel',
        id: `${idPrefix}-panel-${id}`,
        'aria-labelledby': `${idPrefix}-tab-${id}`,
        hidden: (controlledValue || selectedTab) !== id,
      }),
      [controlledValue, selectedTab, idPrefix]
    );

    const contextValue = useMemo(
      () => ({
        selectedTab: controlledValue || selectedTab,
        setSelectedTab,
        registerTab,
        unregisterTab,
        getTabProps,
        getPanelProps,
        vertical,
      }),
      [
        controlledValue,
        selectedTab,
        vertical,
        setSelectedTab,
        registerTab,
        unregisterTab,
        getTabProps,
        getPanelProps,
      ]
    );

    // Set initial selected tab
    useEffect(() => {
      if (!selectedTab && !controlledValue && tabsRef.current.size > 0) {
        const firstEnabledTab = Array.from(tabsRef.current.entries()).find(
          ([, disabled]) => !disabled
        )?.[0];
        if (firstEnabledTab) {
          setSelectedTab(firstEnabledTab);
        }
      }
    }, [selectedTab, controlledValue, setSelectedTab]);

    return (
      <TabsContext.Provider value={contextValue}>
        <TabsContainer
          ref={ref}
          $vertical={vertical}
          className={className}
          {...rest}
        >
          {children}
        </TabsContainer>
      </TabsContext.Provider>
    );
  }
);

export const TabList: React.FC<BaseComponentProps & { vertical?: boolean }> = ({
  children,
  vertical,
  className,
  ...rest
}) => {
  const parentContext = useContext(TabsContext);

  // Use vertical prop from parent Tabs component if not explicitly provided
  const isVertical =
    vertical !== undefined
      ? vertical
      : parentContext && 'vertical' in parentContext
        ? parentContext.vertical
        : false;

  return (
    <StyledTabList
      $vertical={isVertical}
      role="tablist"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      className={className}
      {...rest}
    >
      {React.Children.toArray(children).map(child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            $vertical: isVertical,
          });
        }
        return child;
      })}
    </StyledTabList>
  );
};

export const Tab: React.FC<TabProps> = ({
  value,
  disabled = false,
  children,
  className,
  $vertical,
  ...rest
}) => {
  const { selectedTab, registerTab, unregisterTab, getTabProps } = useTabs();

  useEffect(() => {
    registerTab(value, disabled);
    return () => unregisterTab(value);
  }, [value, disabled, registerTab, unregisterTab]);

  return (
    <TabButton
      $selected={selectedTab === value}
      $vertical={$vertical}
      disabled={disabled}
      className={className}
      {...getTabProps(value)}
      {...rest}
    >
      {children}
    </TabButton>
  );
};

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className,
  ...rest
}) => {
  const { getPanelProps } = useTabs();

  return (
    <TabPanelContainer
      className={className}
      {...getPanelProps(value)}
      {...rest}
    >
      {children}
    </TabPanelContainer>
  );
};

// TypeScript exports
Tabs.displayName = 'Tabs';
TabList.displayName = 'TabList';
Tab.displayName = 'Tab';
TabPanel.displayName = 'TabPanel';
