import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps, ColorScheme, Size } from '../../../types';

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
   * @private - Used for styled-components props
   */
  as?: React.ElementType;
}

const getVariantStyles = (
  variant: ButtonVariant = 'primary',
  colorScheme: ColorScheme = 'primary'
) => {
  const variants = {
    primary: css`
      background: ${({ theme }) =>
        theme.colors[colorScheme] || theme.colors.primary};
      color: #ffffff;
      &:hover:not(:disabled) {
        background: ${({ theme }) =>
          theme.colors[`${colorScheme}Hover`] || theme.colors.primaryHover};
      }
    `,
    secondary: css`
      background: ${({ theme }) => theme.colors.background.secondary};
      color: ${({ theme }) => theme.colors.text.primary};
      border: 1px solid ${({ theme }) => theme.colors.border.default};
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.background.hover};
      }
    `,
    success: css`
      background: ${({ theme }) =>
        theme.colors.success || theme.colors.text.success};
      color: #ffffff;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
    danger: css`
      background: ${({ theme }) =>
        theme.colors.error || theme.colors.text.error};
      color: #ffffff;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
    warning: css`
      background: ${({ theme }) =>
        theme.colors.warning || theme.colors.text.warning};
      color: #000000;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    `,
    text: css`
      background: transparent;
      color: ${({ theme }) =>
        theme.colors[colorScheme] || theme.colors.primary};
      padding: ${({ theme }) => theme.spacing.xs};
      &:hover:not(:disabled) {
        text-decoration: underline;
        background: transparent;
      }
    `,
    outline: css`
      background: transparent;
      color: ${({ theme }) =>
        theme.colors[colorScheme] || theme.colors.primary};
      border: 1px solid
        ${({ theme }) => theme.colors[colorScheme] || theme.colors.primary};
      &:hover:not(:disabled) {
        background: ${({ theme }) =>
          theme.colors[colorScheme]
            ? `${theme.colors[colorScheme]}10`
            : `${theme.colors.primary}10`};
      }
    `,
  };
  return variants[variant];
};

const getSizeStyles = (size: Size = 'medium') => {
  const sizes = {
    small: css`
      padding: ${({ theme }) => theme.spacing.xs}
        ${({ theme }) => theme.spacing.sm};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    `,
    medium: css`
      padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
      font-size: ${({ theme }) => theme.typography.fontSize.md};
    `,
    large: css`
      padding: ${({ theme }) => theme.spacing.md}
        ${({ theme }) => theme.spacing.lg};
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    `,
  };
  return sizes[size];
};

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: Size;
  $isFullWidth: boolean;
  $colorScheme: ColorScheme;
  $isLoading?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
  gap: ${({ theme }) => theme.spacing.xs};
  position: relative;

  ${({ $variant, $colorScheme }) => getVariantStyles($variant, $colorScheme)}
  ${({ $size }) => getSizeStyles($size)}

  &:disabled {
    background: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Loading state styles */
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      color: transparent !important;
      pointer-events: none;
      position: relative;
    `}
`;

const LoadingSpinner = styled.span`
  position: absolute;
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

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
      ...rest
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $colorScheme={colorScheme}
        $isFullWidth={isFullWidth}
        $isLoading={isLoading}
        disabled={disabled || isLoading}
        className={className}
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
        {isLoading && <LoadingSpinner aria-hidden="true" />}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
