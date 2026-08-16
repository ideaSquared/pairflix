import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastProps as ToastContextProps } from './ToastContext';
import { closeButton, toast, toastMessage } from './Toast.css';

interface ToastProps {
  toast: ToastContextProps;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast: toastData, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of time-related state
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(toastData.duration || 5000);

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
    if (toastData.pauseOnHover && !pausedAtRef.current) {
      clearToastTimer();

      // Calculate elapsed time and store remaining time
      const now = Date.now();
      const elapsedTime = now - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        0,
        (toastData.duration || 5000) - elapsedTime
      );
      pausedAtRef.current = now;
    }
  }, [toastData.pauseOnHover, toastData.duration, clearToastTimer]);

  // Handle mouse leave - resume timer
  const handleMouseLeave = useCallback(() => {
    if (toastData.pauseOnHover && pausedAtRef.current) {
      startTimeRef.current = Date.now();
      pausedAtRef.current = null;

      // Restart timer with remaining time
      setToastTimer(remainingTimeRef.current);
    }
  }, [toastData.pauseOnHover, setToastTimer]);

  // Initialize timer on mount
  useEffect(() => {
    if (toastData.duration && toastData.duration > 0) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = toastData.duration;
      setToastTimer(toastData.duration);
    }

    return clearToastTimer;
  }, [toastData.duration, setToastTimer, clearToastTimer]);

  return (
    <div
      className={toast({ variant: toastData.variant, isExiting })}
      role="alert"
      aria-live={toastData.variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={toastMessage}>{toastData.message}</div>
      {toastData.closeable && (
        <button
          className={closeButton}
          onClick={handleClose}
          aria-label="Close notification"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
