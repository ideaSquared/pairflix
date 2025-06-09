import { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';

/**
 * SessionManager monitors user activity and enforces session timeout settings.
 * It automatically logs out inactive users based on the configured timeout.
 */
const SessionManager: React.FC = () => {
  const { settings } = useSettings();
  const { logout } = useAuth();

  useEffect(() => {
    if (!settings?.security.sessionTimeout) return;

    // Convert minutes to milliseconds
    const timeoutMs = settings.security.sessionTimeout * 60 * 1000;
    let activityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        logout();
        alert(
          'Your session has expired due to inactivity. Please log in again.'
        );
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
  }, [settings?.security.sessionTimeout, logout]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;
