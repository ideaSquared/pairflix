import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps, Size } from '../../../types';
import {
  adornmentWrapper,
  input as inputStyle,
  inputError,
  inputGroup,
  inputLabel,
} from './Input.css';

/**
 * Base props for all input components
 */
export interface InputBaseProps extends BaseComponentProps {
  /**
   * Whether the input takes up the full width of its container
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether the input is in an error state
   * @default false
   */
  isInvalid?: boolean;

  /**
   * The size of the input
   * @default 'medium'
   */
  size?: Size;

  /**
   * Content to display at the start of the input
   */
  startAdornment?: React.ReactNode;

  /**
   * Content to display at the end of the input
   */
  endAdornment?: React.ReactNode;
}

/**
 * Props for the Input component
 */
export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputBaseProps {
  /**
   * Label text for the input
   */
  label?: string;

  /**
   * Helper text displayed below the input
   */
  helperText?: string;

  /**
   * Whether the input is in an error state
   * Alternative to isInvalid for consistent API
   * @default false
   */
  error?: boolean;

  /**
   * Optional ID for the input element (generated from label if not provided)
   */
  id?: string;
}

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @deprecated use `isFullWidth` */
  $isFullWidth?: boolean;
  isFullWidth?: boolean;
}

/**
 * Layout wrapper used by Input (and other form fields) for the
 * label/control/helper-text stack. Exported as a standalone primitive --
 * accepts both `$isFullWidth` and `isFullWidth` since both spellings are in
 * use by existing consumers.
 */
export const InputGroup = ({
  $isFullWidth,
  isFullWidth,
  className,
  children,
  ...rest
}: InputGroupProps) => (
  <div
    className={clsx(
      inputGroup({ isFullWidth: $isFullWidth ?? isFullWidth ?? false }),
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  $isInvalid?: boolean;
  $isRequired?: boolean;
}

export const InputLabel = ({
  $isInvalid,
  $isRequired,
  className,
  htmlFor,
  ...rest
}: InputLabelProps) => (
  <label
    htmlFor={htmlFor}
    className={clsx(
      inputLabel({ isInvalid: $isInvalid, isRequired: $isRequired }),
      className
    )}
    {...rest}
  />
);

export const InputError = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(inputError, className)} {...rest} />
);

const AdornmentWrapper = ({
  position,
  children,
}: {
  position: 'start' | 'end';
  children: React.ReactNode;
}) => <div className={adornmentWrapper({ position })}>{children}</div>;

/**
 * Input component for text entry with optional label and error message
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      isInvalid,
      error,
      helperText,
      required,
      isFullWidth = false,
      startAdornment,
      endAdornment,
      id,
      size = 'medium',
      className,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Support both error and isInvalid props
    const hasError = isInvalid || error;

    return (
      <InputGroup isFullWidth={isFullWidth} className={className}>
        {label && (
          <InputLabel
            htmlFor={inputId}
            $isInvalid={hasError}
            $isRequired={required}
          >
            {label}
          </InputLabel>
        )}
        <div style={{ position: 'relative' }}>
          {startAdornment && (
            <AdornmentWrapper position="start">
              {startAdornment}
            </AdornmentWrapper>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputStyle({
              isInvalid: hasError,
              isFullWidth,
              size,
              hasStartAdornment: !!startAdornment,
              hasEndAdornment: !!endAdornment,
            })}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            required={required}
            {...props}
          />
          {endAdornment && (
            <AdornmentWrapper position="end">{endAdornment}</AdornmentWrapper>
          )}
        </div>
        {helperText && <InputError>{helperText}</InputError>}
      </InputGroup>
    );
  }
);

Input.displayName = 'Input';

export default Input;
