import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ToastProps as ToastContextProps } from './ToastContext';

interface ToastProps {
  toast: ToastContextProps;
  onClose: () => void;
}

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-20px);
    }
`;

interface StyledToastProps {
  $variant: ToastContextProps['type'];
  $isExiting?: boolean;
}

const getVariantStyles = (variant: ToastContextProps['type']) => {
  const variants: Record<
    NonNullable<ToastContextProps['type']>,
    ReturnType<typeof css>
  > = {
    info: css`
      background: ${({ theme }) => theme?.colors?.info || '#03a9f4'};
      color: ${({ theme }) => theme?.colors?.text?.onPrimary || '#ffffff'};
    `,
    success: css`
      background: ${({ theme }) => theme?.colors?.text?.success || '#4caf50'};
      color: ${({ theme }) => theme?.colors?.text?.onPrimary || '#ffffff'};
    `,
    warning: css`
      background: ${({ theme }) => theme?.colors?.text?.warning || '#ff9800'};
      color: ${({ theme }) => theme?.colors?.text?.onPrimary || '#ffffff'};
    `,
    error: css`
      background: ${({ theme }) => theme?.colors?.text?.error || '#f44336'};
      color: ${({ theme }) => theme?.colors?.text?.onPrimary || '#ffffff'};
    `,
  };
  return variants[variant || 'info'];
};

const StyledToast = styled.div<StyledToastProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme?.spacing?.md || '12px'};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.3s ease-out;
  min-width: 300px;
  max-width: 500px;

  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $isExiting }) =>
    $isExiting &&
    css`
      animation: ${fadeOut} 0.3s ease-in forwards;
    `}

    @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
    min-width: unset;
    width: 100%;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: ${({ theme }) => theme?.spacing?.xs || '4px'};
  margin-left: ${({ theme }) => theme?.spacing?.sm || '8px'};
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const ToastMessage = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme?.spacing?.sm || '8px'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
`;

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of time-related state
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(toast.duration || 5000);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  }, [onClose]);

  const clearToastTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setToastTimer = useCallback(
    (duration: number) => {
      clearToastTimer();
      if (duration > 0) {
        timerRef.current = setTimeout(handleClose, duration);
      }
    },
    [clearToastTimer, handleClose]
  );

  // Handle mouse enter - pause timer
  const handleMouseEnter = useCallback(() => {
    if (toast.pauseOnHover && !pausedAtRef.current) {
      clearToastTimer();

      // Calculate elapsed time and store remaining time
      const now = Date.now();
      const elapsedTime = now - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        0,
        (toast.duration || 5000) - elapsedTime
      );
      pausedAtRef.current = now;
    }
  }, [toast.pauseOnHover, toast.duration, clearToastTimer]);

  // Handle mouse leave - resume timer
  const handleMouseLeave = useCallback(() => {
    if (toast.pauseOnHover && pausedAtRef.current) {
      startTimeRef.current = Date.now();
      pausedAtRef.current = null;

      // Restart timer with remaining time
      setToastTimer(remainingTimeRef.current);
    }
  }, [toast.pauseOnHover, setToastTimer]);

  // Initialize timer on mount
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = toast.duration;
      setToastTimer(toast.duration);
    }

    return clearToastTimer;
  }, [toast.duration, setToastTimer, clearToastTimer]);

  return (
    <StyledToast
      $variant={toast.variant}
      $isExiting={isExiting}
      role="alert"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToastMessage>{toast.message}</ToastMessage>
      {toast.closeable && (
        <CloseButton
          onClick={handleClose}
          aria-label="Close notification"
          type="button"
        >
          ✕
        </CloseButton>
      )}
    </StyledToast>
  );
};

export default Toast;
