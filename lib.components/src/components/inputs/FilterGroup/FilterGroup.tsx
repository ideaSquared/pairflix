import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../../styles/theme';
import { Card, CardContent } from '../../data-display/Card';
import { Box } from '../../layout/Box';
import { H2 } from '../../utility/Typography';
import { Button } from '../Button';

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

// Styled Components
interface FilterGroupCardProps {
  $isFullWidth?: boolean;
}

const FilterGroupCard = styled(Card)<FilterGroupCardProps>`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }: { theme: Theme }) => theme.spacing.md};
  margin-top: ${({ theme }: { theme: Theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FilterHeader = styled(Box)`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FilterActions = styled(Box)`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterContent = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => (isExpanded ? '2000px' : '0')};
  opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};
  overflow: hidden;
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.2s ease-in-out;
  will-change: max-height, opacity;
`;

const FilterLabel = styled.label<{ $required?: boolean }>`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};

  ${({ $required, theme }) =>
    $required &&
    css`
      &::after {
        content: '*';
        color: ${theme.colors.text.error};
        margin-left: 4px;
      }
    `}
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

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
      <FilterGroupCard
        $isFullWidth={isFullWidth}
        data-testid="filter-group"
        variant="outlined"
        aria-label={ariaLabel}
      >
        <CardContent>
          <FilterHeader justifyContent="space-between" alignItems="center">
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
          </FilterHeader>

          <FilterContent id="filter-content" isExpanded={isExpanded}>
            <FiltersGrid>{children}</FiltersGrid>

            <FilterActions>
              <div>
                <Button
                  variant="primary"
                  onClick={handleApply}
                  disabled={disabled || !isDirty}
                  isLoading={isApplying}
                  style={{ marginRight: '0.5rem' }}
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
            </FilterActions>
          </FilterContent>
        </CardContent>
      </FilterGroupCard>
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
      helpText,
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
        <FilterLabel htmlFor={id} $required={required}>
          {label}
        </FilterLabel>
        <div
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={descriptionId}
        >
          {children}
        </div>
        {helpText && <HelpText>{helpText}</HelpText>}
        {error && <ErrorText role="alert">{error}</ErrorText>}
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
        <FilterActions>
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
        </FilterActions>
      </FilterItem>
    );
  }
);

QuickFilter.displayName = 'QuickFilter';

export default FilterGroup;
