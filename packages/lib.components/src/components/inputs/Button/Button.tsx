import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps, ColorScheme, Size } from '../../../types';
import { button, loadingSpinner } from './Button.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'text'
  | 'outline';

export interface ButtonProps extends BaseComponentProps {
  /**
   * The visual style of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * The size of the button
   * @default 'medium'
   */
  size?: Size;

  /**
   * Color scheme to use for the button
   * @default 'primary'
   */
  colorScheme?: ColorScheme;

  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  isFullWidth?: boolean;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon to display before the button content
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after the button content
   */
  rightIcon?: React.ReactNode;

  /**
   * Click handler for the button
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /**
   * Optional form to associate this button with
   */
  form?: string;

  /**
   * Button type attribute
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * @private - unused; kept for backwards compatibility
   */
  as?: React.ElementType;
}

/**
 * Button component for user interactions
 */
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>
>(
  (
    {
      variant = 'primary',
      size = 'medium',
      colorScheme = 'primary',
      isFullWidth = false,
      disabled = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      type = 'button',
      as: _as,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          button({ variant, colorScheme, size, isFullWidth, isLoading }),
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        type={type}
        {...rest}
      >
        {leftIcon && !isLoading && (
          <span className="button-left-icon">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && (
          <span className="button-right-icon">{rightIcon}</span>
        )}
        {isLoading && <span className={loadingSpinner} aria-hidden="true" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
