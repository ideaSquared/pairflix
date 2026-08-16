import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import {
  actions,
  alert,
  closeButton,
  content,
  description,
  iconWrapper,
  message,
} from './Alert.css';

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

/**
 * Alert component for displaying status messages, notifications, and errors
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      size = 'medium',
      message: messageProp,
      description: descriptionProp,
      dismissible = false,
      onDismiss,
      visible = true,
      icon,
      animate = true,
      actions: actionsProp,
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
      <div
        ref={ref}
        className={clsx(alert({ variant, size, visible, animate }), className)}
        role="alert"
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        {...rest}
      >
        {(icon || defaultIcon) && (
          <div className={iconWrapper}>{icon || defaultIcon}</div>
        )}
        <div className={content}>
          {title && <div className={message}>{title}</div>}
          {messageProp && <div className={message}>{messageProp}</div>}
          {children && <div>{children}</div>}
          {descriptionProp && (
            <div className={description}>{descriptionProp}</div>
          )}
          {actionsProp && <div className={actions}>{actionsProp}</div>}
        </div>
        {(dismissible || onClose) && (
          <button
            className={closeButton}
            onClick={handleClose}
            aria-label="Close alert"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
