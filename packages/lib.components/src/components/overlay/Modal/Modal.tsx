import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import type { BaseComponentProps } from '../../../types';
import * as styles from './Modal.css';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

/**
 * Props for the Modal component
 */
export interface ModalProps extends BaseComponentProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Title of the modal
   */
  title?: string;

  /**
   * Size of the modal
   * @default 'medium'
   */
  size?: ModalSize | string;

  /**
   * Whether to close when clicking outside
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether to close when ESC key is pressed
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Initial element to focus when modal opens
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;

  /**
   * Element to return focus to when modal closes
   */
  finalFocusRef?: React.RefObject<HTMLElement | null>;

  /**
   * Custom render function for header
   */
  headerRender?: (props: {
    onClose: () => void;
    title?: string;
  }) => React.ReactNode;

  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether to disable scrolling of the body when modal is open
   * @default true
   */
  blockScrollOnMount?: boolean;

  /**
   * Modal content
   */
  children: React.ReactNode;
}

const getModalMaxWidth = (size: ModalSize | string = 'medium'): string => {
  switch (size) {
    case 'small':
      return '400px';
    case 'medium':
      return '600px';
    case 'large':
      return '800px';
    case 'fullscreen':
      return '100%';
    default:
      if (typeof size === 'string' && size.match(/^\d+(%|px|em|rem|vh|vw)$/)) {
        return size;
      }
      return '600px';
  }
};

/**
 * Modal component for displaying content in an overlay
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  initialFocusRef,
  finalFocusRef,
  headerRender,
  showCloseButton = true,
  blockScrollOnMount = true,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const previousActiveElement = useRef<Element | null>(null);

  // Use our custom focus trap hook
  useFocusTrap(modalRef, isOpen && closeOnEsc, onClose);

  // Ensure we only mount the portal after the component is mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle initial and final focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;

      // Focus the initial element if specified, otherwise first focusable element is handled by useFocusTrap
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      }
    } else {
      // Restore focus when modal closes
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus();
      } else if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, initialFocusRef, finalFocusRef]);

  // Handle body scroll locking
  useEffect(() => {
    if (!blockScrollOnMount) return;

    if (isOpen) {
      // Store original style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Set overflow to hidden
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore original style when modal closes or component unmounts
        document.body.style.overflow = originalStyle;
      };
    } else {
      // Ensure overflow is reset when isOpen becomes false
      document.body.style.overflow = '';
    }
  }, [isOpen, blockScrollOnMount]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        closeOnBackdropClick &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, closeOnBackdropClick]);

  // Don't render anything on the server or if not mounted yet or if modal is closed
  if (!mounted || !isOpen) return null;

  // Make sure we have a valid DOM element to create the portal
  const portalTarget = document.body;
  if (!portalTarget) return null;

  const modalContent = (
    <div
      className={clsx(styles.overlay, className)}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={styles.content({ fullscreen: size === 'fullscreen' })}
        style={{ maxWidth: getModalMaxWidth(size) }}
        role="document"
      >
        {headerRender ? (
          headerRender({ onClose, title })
        ) : title || showCloseButton ? (
          <div className={styles.header}>
            {title && (
              <h3 id="modal-title" className={styles.title}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, portalTarget);
};

export default Modal;
