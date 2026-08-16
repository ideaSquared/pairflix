import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps, Size } from '../../../types';
import { select, selectError, selectGroup, selectLabel } from './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectBaseProps extends BaseComponentProps {
  /**
   * Whether the select takes up the full width of its container
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether the select is in an error state
   * @default false
   */
  isInvalid?: boolean;

  /**
   * The size of the select
   * @default 'medium'
   */
  size?: Size;

  /**
   * Array of options for the select
   */
  options?: SelectOption[];

  /**
   * Label text for the select
   */
  label?: string;

  /**
   * Helper text displayed below the select
   */
  helperText?: string;

  /**
   * Whether the select is required
   * @default false
   */
  required?: boolean;

  /**
   * Custom placeholder text
   */
  placeholder?: string;
}

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    SelectBaseProps {}

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  $isFullWidth?: boolean;
}

export const SelectGroup = ({
  $isFullWidth,
  className,
  children,
  ...rest
}: SelectGroupProps) => (
  <div
    className={clsx(selectGroup({ isFullWidth: $isFullWidth }), className)}
    {...rest}
  >
    {children}
  </div>
);

export interface SelectLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  $isInvalid?: boolean;
  $isRequired?: boolean;
}

export const SelectLabel = ({
  $isInvalid,
  $isRequired,
  className,
  htmlFor,
  ...rest
}: SelectLabelProps) => (
  <label
    htmlFor={htmlFor}
    className={clsx(
      selectLabel({ isInvalid: $isInvalid, isRequired: $isRequired }),
      className
    )}
    {...rest}
  />
);

export const SelectError = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(selectError, className)} {...rest} />
);

/**
 * Enhanced Select component with TypeScript support and accessibility features
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      isInvalid,
      helperText,
      required,
      isFullWidth = false,
      size = 'medium',
      options = [],
      className,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const selectId =
      props.id ||
      (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <SelectGroup $isFullWidth={isFullWidth} className={className}>
        {label && (
          <SelectLabel
            htmlFor={selectId}
            $isInvalid={isInvalid}
            $isRequired={required}
          >
            {label}
          </SelectLabel>
        )}
        <select
          ref={ref}
          id={selectId}
          className={select({ isInvalid, isFullWidth, size })}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {helperText && <SelectError>{helperText}</SelectError>}
      </SelectGroup>
    );
  }
);

Select.displayName = 'Select';

export default Select;
