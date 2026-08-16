import { SessionManager } from '@pairflix/components';
import React, { useCallback, useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import * as styles from './AppSessionManager.css';

/**
 * Enhanced session manager for admin application with token refresh capabilities
 */
const AppSessionManager: React.FC = () => {
  const { settings } = useSettings();
  const { logout, refreshToken, isTokenNearExpiry, isAuthenticated } =
    useAuth();
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check token expiry every minute - only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowTokenWarning(false);
      return;
    }

    const checkTokenExpiry = () => {
      if (isTokenNearExpiry()) {
        setShowTokenWarning(true);
      } else {
        setShowTokenWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [isTokenNearExpiry, isAuthenticated]);

  const handleRefreshToken = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshToken();
      setShowTokenWarning(false);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // The refreshToken function will handle logout on failure
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, isRefreshing]);

  const handleDismissWarning = useCallback(() => {
    setShowTokenWarning(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  return (
    <>
      <SessionManager
        sessionTimeout={settings?.security.sessionTimeout}
        onSessionExpire={logout}
        expireMessage="Your admin session has expired due to inactivity. Please log in again."
        showAlert={true}
      />

      {showTokenWarning && (
        <div className={styles.sessionWarning}>
          <div>
            <strong>Session Warning</strong>
          </div>
          <div>
            Your session will expire soon. Refresh your session to continue
            working.
          </div>
          <div className={styles.warningActions}>
            <button
              className={styles.warningButton}
              onClick={handleRefreshToken}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>
            <button
              className={styles.warningButton}
              onClick={handleDismissWarning}
            >
              Dismiss
            </button>
            <button className={styles.warningButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSessionManager;
