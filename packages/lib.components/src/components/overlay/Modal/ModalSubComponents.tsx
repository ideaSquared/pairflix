import clsx from 'clsx';
import React from 'react';
import type { BaseComponentProps } from '../../../types';
import * as styles from './ModalSubComponents.css';

/**
 * Props for ModalBody component
 */
export interface ModalBodyProps extends BaseComponentProps {
  /**
   * The content to be rendered inside the modal body
   */
  children: React.ReactNode;

  /**
   * Whether to remove default padding
   * @default false
   */
  noPadding?: boolean;
}

/**
 * Props for ModalFooter component
 */
export interface ModalFooterProps extends BaseComponentProps {
  /**
   * The content to be rendered inside the modal footer
   */
  children: React.ReactNode;

  /**
   * Whether to align buttons/content to the start
   * @default 'end'
   */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';

  /**
   * Whether to use divider above footer
   * @default true
   */
  withDivider?: boolean;
}

/**
 * ModalBody component for standardized content area in Modal
 */
export const StyledModalBody: React.FC<ModalBodyProps> = ({
  children,
  noPadding,
  className,
  ...rest
}) => {
  return (
    <div className={clsx(styles.body({ noPadding }), className)} {...rest}>
      {children}
    </div>
  );
};

/**
 * ModalFooter component for standardized actions area in Modal
 */
export const StyledModalFooter: React.FC<ModalFooterProps> = ({
  children,
  justifyContent = 'end',
  withDivider = true,
  className,
  ...rest
}) => {
  return (
    <div
      className={clsx(styles.footer({ withDivider }), className)}
      style={{ justifyContent }}
      {...rest}
    >
      {children}
    </div>
  );
};
