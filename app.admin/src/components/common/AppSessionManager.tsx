import { SessionManager } from '@pairflix/components';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';

const SessionWarning = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ theme }) => theme.colors.background.warning || '#fff3cd'};
  border: 1px solid ${({ theme }) => theme.colors.border.warning || '#ffeaa7'};
  color: ${({ theme }) => theme.colors.text.warning || '#856404'};
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 350px;
  font-size: 14px;
`;

const WarningActions = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

const WarningButton = styled.button`
  background: ${({ theme }) => theme.colors.primary || '#007bff'};
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Enhanced session manager for admin application with token refresh capabilities
 */
const AppSessionManager: React.FC = () => {
  const { settings } = useSettings();
  const { logout, refreshToken, isTokenNearExpiry } = useAuth();
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check token expiry every minute
  useEffect(() => {
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
  }, [isTokenNearExpiry]);

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
        <SessionWarning>
          <div>
            <strong>Session Warning</strong>
          </div>
          <div>
            Your session will expire soon. Refresh your session to continue
            working.
          </div>
          <WarningActions>
            <WarningButton onClick={handleRefreshToken} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </WarningButton>
            <WarningButton onClick={handleDismissWarning}>
              Dismiss
            </WarningButton>
            <WarningButton onClick={handleLogout}>Logout</WarningButton>
          </WarningActions>
        </SessionWarning>
      )}
    </>
  );
};

export default AppSessionManager;
