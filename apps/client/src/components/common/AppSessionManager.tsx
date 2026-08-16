import { SessionManager } from '@pairflix/components';
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';

/**
 * App-specific wrapper for the shared SessionManager component
 * Provides the necessary auth and settings context
 */
const AppSessionManager: React.FC = () => {
  const { settings } = useSettings();
  const { logout } = useAuth();

  return (
    <SessionManager
      sessionTimeout={settings?.security.sessionTimeout}
      onSessionExpire={logout}
      expireMessage="Your session has expired due to inactivity. Please log in again."
      showAlert={true}
    />
  );
};

export default AppSessionManager;
