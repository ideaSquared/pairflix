import React, { forwardRef, useState } from 'react';
import { Input, type InputProps } from './Input';
import { toggleButton } from './PasswordInput.css';

/**
 * Props for PasswordInput component
 */
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * Whether to show the toggle password button
   * @default true
   */
  showToggle?: boolean;

  /**
   * Custom icon for show password
   */
  showIcon?: React.ReactNode;

  /**
   * Custom icon for hide password
   */
  hideIcon?: React.ReactNode;
}

/**
 * Password input component with show/hide toggle functionality
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, showIcon, hideIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      setShowPassword(!showPassword);
    };

    const defaultShowIcon = '👁️';
    const defaultHideIcon = '👁️‍🗨️';

    const endAdornment = showToggle ? (
      <button
        type="button"
        className={toggleButton}
        onClick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword
          ? showIcon || defaultShowIcon
          : hideIcon || defaultHideIcon}
      </button>
    ) : (
      props.endAdornment
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        endAdornment={endAdornment}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
