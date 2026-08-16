import { useEffect } from 'react';

interface SessionManagerProps {
  /**
   * Session timeout in minutes
   */
  sessionTimeout?: number;
  /**
   * Function to call when session expires
   */
  onSessionExpire: () => void;
  /**
   * Custom message to show when session expires
   */
  expireMessage?: string;
  /**
   * Whether to show an alert when session expires
   */
  showAlert?: boolean;
}

/**
 * SessionManager monitors user activity and enforces session timeout.
 * It automatically calls onSessionExpire when inactive users exceed the timeout.
 */
export const SessionManager: React.FC<SessionManagerProps> = ({
  sessionTimeout,
  onSessionExpire,
  expireMessage = 'Your session has expired due to inactivity. Please log in again.',
  showAlert = true,
}) => {
  useEffect(() => {
    if (!sessionTimeout) return;

    // Convert minutes to milliseconds
    const timeoutMs = sessionTimeout * 60 * 1000;
    let activityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        onSessionExpire();
        if (showAlert) {
          alert(expireMessage);
        }
      }, timeoutMs);
    };

    // Set up event listeners to track user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Initialize the timer
    resetTimer();

    // Clean up event listeners
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(activityTimer);
    };
  }, [sessionTimeout, onSessionExpire, expireMessage, showAlert]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;
