import clsx from 'clsx';
import * as React from 'react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import type { BaseComponentProps, Size } from '../../../types';
import {
  clearButton,
  searchButton,
  searchContainer,
  searchInput,
} from './SearchBar.css';

export interface SearchBarProps extends BaseComponentProps {
  /**
   * Value of the search input
   */
  value?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Callback when value changes
   */
  onChange?: (value: string) => void;

  /**
   * Callback when search is triggered (on enter or search button click)
   */
  onSearch?: (value: string) => void;

  /**
   * Whether to show the search button
   * @default true
   */
  showButton?: boolean;

  /**
   * Custom text for the search button
   * @default "Search"
   */
  buttonText?: string;

  /**
   * Whether to show a clear button when there's input
   * @default true
   */
  showClear?: boolean;

  /**
   * Size of the search bar
   * @default 'medium'
   */
  size?: Size;

  /**
   * Whether the search bar takes up the full width
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether to auto-focus the input
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Debounce time in milliseconds for onChange
   * @default 300
   */
  debounceTime?: number;

  /**
   * Whether the search bar is in an error state
   * @default false
   */
  isInvalid?: boolean;

  /**
   * Aria label for the search input
   */
  'aria-label'?: string;

  /**
   * Whether the search bar is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * SearchBar component with built-in debouncing and clear functionality
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      placeholder = 'Search...',
      onChange,
      onSearch,
      showButton = true,
      buttonText = 'Search',
      showClear = true,
      size = 'medium',
      isFullWidth = false,
      autoFocus = false,
      debounceTime = 300,
      isInvalid = false,
      disabled = false,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value || '');
    const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        if (onChange) {
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
          }

          debounceTimeout.current = setTimeout(() => {
            onChange(newValue);
          }, debounceTime);
        }
      },
      [onChange, debounceTime]
    );

    const handleClear = useCallback(() => {
      setLocalValue('');
      if (onChange) {
        onChange('');
      }
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, [onChange, ref]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onSearch) {
          onSearch(localValue);
        }
      },
      [localValue, onSearch]
    );

    // Clean up timeout on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
      };
    }, []);

    // Update local value when prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    return (
      <div className={clsx(searchContainer({ isFullWidth }), className)}>
        <input
          ref={ref}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={searchInput({
            size,
            isFullWidth,
            isInvalid,
            hasButton: showButton,
          })}
          disabled={disabled}
          // opt-in via the autoFocus prop (default false); consumer decides
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          aria-label={ariaLabel || 'Search input'}
          {...props}
        />
        {showClear && localValue && !disabled && (
          <button
            onClick={handleClear}
            className={clearButton({ size })}
            type="button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        {showButton && (
          <button
            onClick={() => onSearch?.(localValue)}
            className={searchButton({ size })}
            disabled={disabled}
            type="button"
            aria-label={buttonText}
          >
            {buttonText}
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
