import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { Input, InputProps } from './Input';

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

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary || '#0077cc'};
    border-radius: 4px;
  }
`;

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
      <ToggleButton
        type="button"
        onClick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword
          ? showIcon || defaultShowIcon
          : hideIcon || defaultHideIcon}
      </ToggleButton>
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
