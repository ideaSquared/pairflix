import React, { forwardRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { BaseComponentProps } from '../../../types';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertSize = 'small' | 'medium' | 'large';

export interface AlertProps extends BaseComponentProps {
  /**
   * The visual style of the alert
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * The size of the alert
   * @default 'medium'
   */
  size?: AlertSize;

  /**
   * Main alert message
   * Required unless children are provided
   */
  message?: string;

  /**
   * Alert content as children
   * Required unless message is provided
   */
  children?: React.ReactNode;

  /**
   * Optional additional description
   */
  description?: string;

  /**
   * Whether the alert can be dismissed
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;

  /**
   * Whether alert is visible
   * @default true
   */
  visible?: boolean;

  /**
   * Icon to display before the message
   */
  icon?: React.ReactNode;

  /**
   * Whether to show alert with animation
   * @default true
   */
  animate?: boolean;

  /**
   * Additional actions (buttons, links)
   */
  actions?: React.ReactNode;

  /**
   * Optional title for the alert
   */
  title?: string;

  /**
   * Optional callback when close button is clicked
   */
  onClose?: () => void;
}

const slideIn = keyframes`
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const getVariantStyles = (variant: AlertVariant = 'info') => {
  const variants = {
    info: css`
      background: ${({ theme }) => theme?.colors?.info + '15' || '#03a9f415'};
      border-color: ${({ theme }) => theme?.colors?.info || '#03a9f4'};
      color: ${({ theme }) => theme?.colors?.info || '#03a9f4'};
    `,
    success: css`
      background: ${({ theme }) =>
        theme?.colors?.text?.success + '15' || '#4caf5015'};
      border-color: ${({ theme }) => theme?.colors?.text?.success || '#4caf50'};
      color: ${({ theme }) => theme?.colors?.text?.success || '#4caf50'};
    `,
    warning: css`
      background: ${({ theme }) =>
        theme?.colors?.text?.warning + '15' || '#ff980015'};
      border-color: ${({ theme }) => theme?.colors?.text?.warning || '#ff9800'};
      color: ${({ theme }) => theme?.colors?.text?.warning || '#ff9800'};
    `,
    error: css`
      background: ${({ theme }) =>
        theme?.colors?.text?.error + '15' || '#f4433615'};
      border-color: ${({ theme }) => theme?.colors?.text?.error || '#f44336'};
      color: ${({ theme }) => theme?.colors?.text?.error || '#f44336'};
    `,
  };
  return variants[variant];
};

const getSizeStyles = (size: AlertSize = 'medium') => {
  const sizes = {
    small: css`
      padding: ${({ theme }) => theme?.spacing?.xs || '8px'}
        ${({ theme }) => theme?.spacing?.sm || '12px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
    `,
    medium: css`
      padding: ${({ theme }) => theme?.spacing?.sm || '12px'}
        ${({ theme }) => theme?.spacing?.md || '16px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '16px'};
    `,
    large: css`
      padding: ${({ theme }) => theme?.spacing?.md || '16px'}
        ${({ theme }) => theme?.spacing?.lg || '24px'};
      font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '18px'};
    `,
  };
  return sizes[size];
};

interface StyledAlertProps {
  $variant: AlertVariant;
  $size: AlertSize;
  $animate?: boolean;
  $visible?: boolean;
}

const StyledAlert = styled.div<StyledAlertProps>`
  position: relative;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: flex-start;
  gap: ${({ theme }) => theme?.spacing?.sm || '12px'};
  border-left: 4px solid;
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  animation: ${({ $animate }) =>
    $animate
      ? css`
          ${slideIn} 0.3s ease-out
        `
      : 'none'};

  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
`;

const Content = styled.div`
  flex: 1;
`;

const Message = styled.div`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

const Description = styled.div`
  margin-top: ${({ theme }) => theme?.spacing?.xs || '4px'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
  font-size: 0.9em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme?.spacing?.xs || '4px'};
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.sm || '12px'};
  margin-top: ${({ theme }) => theme?.spacing?.sm || '12px'};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2em;
`;

/**
 * Alert component for displaying status messages, notifications, and errors
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      size = 'medium',
      message,
      description,
      dismissible = false,
      onDismiss,
      visible = true,
      icon,
      animate = true,
      actions,
      className,
      children,
      title,
      onClose,
      ...rest
    },
    ref
  ) => {
    // Use appropriate handler based on prop provided
    const handleClose = onClose || onDismiss;

    // Default icons based on variant
    const defaultIcon = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
    }[variant];

    return (
      <StyledAlert
        ref={ref}
        $variant={variant}
        $size={size}
        $animate={animate}
        $visible={visible}
        className={className}
        role="alert"
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        {...rest}
      >
        {(icon || defaultIcon) && (
          <IconWrapper>{icon || defaultIcon}</IconWrapper>
        )}
        <Content>
          {title && <Message>{title}</Message>}
          {message && <Message>{message}</Message>}
          {children && <div>{children}</div>}
          {description && <Description>{description}</Description>}
          {actions && <Actions>{actions}</Actions>}
        </Content>
        {(dismissible || onClose) && (
          <CloseButton
            onClick={handleClose}
            aria-label="Close alert"
            type="button"
          >
            ✕
          </CloseButton>
        )}
      </StyledAlert>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
