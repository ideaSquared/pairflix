import clsx from 'clsx';
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Card, CardContent } from '../../data-display/Card';
import { Box } from '../../layout/Box';
import { H2 } from '../../utility/Typography';
import { Button } from '../Button';
import {
  applyButtonSpacing,
  errorText,
  filterActions,
  filterContent,
  filterGroupCard,
  filterHeader,
  filterLabel,
  filtersGrid,
  helpText,
} from './FilterGroup.css';

// Types
export interface FilterGroupContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  isDisabled?: boolean;
}

export interface FilterGroupProps {
  title?: string;
  children: React.ReactNode;
  onApply: () => void | Promise<void>;
  onClear: () => void;
  actionComponent?: React.ReactNode;
  defaultExpanded?: boolean;
  isFullWidth?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface FilterItemProps {
  label: string;
  children: React.ReactNode;
  helpText?: string;
  required?: boolean;
  error?: string;
  isFullWidth?: boolean;
  ariaDescription?: string;
}

// Context
const FilterGroupContext = createContext<FilterGroupContextType>({
  isDirty: false,
  setIsDirty: () => {
    // Default empty implementation
  },
  isDisabled: false,
});

/**
 * FilterGroup component for creating collapsible filter sections
 */
export const FilterGroup: React.FC<FilterGroupProps> = ({
  title = 'Filters',
  children,
  onApply,
  onClear,
  actionComponent,
  defaultExpanded = true,
  isFullWidth = false,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDirty, setIsDirty] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleClear = () => {
    onClear();
    setIsDirty(false);
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
      setIsDirty(false);
    } finally {
      setIsApplying(false);
    }
  };

  const contextValue = {
    isDirty,
    setIsDirty,
    isDisabled: disabled,
  };

  return (
    <FilterGroupContext.Provider value={contextValue}>
      <Card
        className={filterGroupCard({ isFullWidth })}
        data-testid="filter-group"
        variant="outlined"
        aria-label={ariaLabel}
      >
        <CardContent>
          <Box
            className={filterHeader}
            justifyContent="space-between"
            alignItems="center"
          >
            <H2>{title}</H2>
            <Button
              variant="text"
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="filter-content"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </Box>

          <div id="filter-content" className={filterContent({ isExpanded })}>
            <div className={filtersGrid}>{children}</div>

            <Box className={filterActions}>
              <div>
                <Button
                  variant="primary"
                  onClick={handleApply}
                  disabled={disabled || !isDirty}
                  isLoading={isApplying}
                  className={applyButtonSpacing}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  Clear Filters
                </Button>
              </div>

              {actionComponent}
            </Box>
          </div>
        </CardContent>
      </Card>
    </FilterGroupContext.Provider>
  );
};

/**
 * FilterItem component for individual filter inputs
 */
export const FilterItem = forwardRef<HTMLDivElement, FilterItemProps>(
  (
    {
      label,
      children,
      helpText: helpTextProp,
      required,
      error,
      isFullWidth,
      ariaDescription,
      ...props
    },
    ref
  ) => {
    const { setIsDirty, isDisabled } = useContext(FilterGroupContext);

    const handleChange = useCallback(() => {
      if (!isDisabled) {
        setIsDirty(true);
      }
    }, [isDisabled, setIsDirty]);

    const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const descriptionId = ariaDescription ? `${id}-description` : undefined;

    return (
      <div
        ref={ref}
        style={{ width: isFullWidth ? '100%' : 'auto' }}
        onChange={handleChange}
        data-testid="filter-item"
        {...props}
      >
        <label
          htmlFor={id}
          className={clsx(filterLabel({ required: !!required }))}
        >
          {label}
        </label>
        <div
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={descriptionId}
        >
          {children}
        </div>
        {helpTextProp && <p className={helpText}>{helpTextProp}</p>}
        {error && (
          <p className={errorText} role="alert">
            {error}
          </p>
        )}
        {ariaDescription && (
          <div id={descriptionId} className="sr-only">
            {ariaDescription}
          </div>
        )}
      </div>
    );
  }
);

FilterItem.displayName = 'FilterItem';

/**
 * QuickFilter component for simple button-based filters
 */
export interface QuickFilterProps extends Omit<FilterItemProps, 'children'> {
  /**
   * Array of options for the quick filter
   */
  options: { label: string; value: string }[];

  /**
   * Currently selected value
   */
  value: string;

  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void;

  /**
   * Whether to allow deselection
   * @default false
   */
  allowDeselect?: boolean;
}

export const QuickFilter = forwardRef<HTMLDivElement, QuickFilterProps>(
  (
    { label, options, value, onChange, allowDeselect = false, ...props },
    ref
  ) => {
    const { setIsDirty, isDisabled } = useContext(FilterGroupContext);

    const handleChange = useCallback(
      (newValue: string) => {
        if (!isDisabled) {
          const finalValue =
            allowDeselect && newValue === value ? '' : newValue;
          onChange(finalValue);
          setIsDirty(true);
        }
      },
      [allowDeselect, isDisabled, onChange, setIsDirty, value]
    );

    return (
      <FilterItem ref={ref} label={label} {...props}>
        <Box className={filterActions}>
          {options.map(option => (
            <Button
              key={option.value}
              variant={value === option.value ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleChange(option.value)}
              disabled={isDisabled}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </FilterItem>
    );
  }
);

QuickFilter.displayName = 'QuickFilter';

export default FilterGroup;
