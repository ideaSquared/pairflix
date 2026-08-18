import { SessionManager } from '@pairflix/components';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

// Not backend-configurable -- SettingsTree has no session-timeout key -- so this
// mirrors apps/client's AppSessionManager's own hardcoded default.
const SESSION_TIMEOUT_MINUTES = 30;

/**
 * Logs the admin out after inactivity. Session lifetime itself is server-side
 * (an opaque cookie) -- there's no client-visible token to warn about or refresh.
 */
const AppSessionManager: React.FC = () => {
  const { logout } = useAuth();

  return (
    <SessionManager
      sessionTimeout={SESSION_TIMEOUT_MINUTES}
      onSessionExpire={logout}
      expireMessage="Your admin session has expired due to inactivity. Please log in again."
      showAlert={true}
    />
  );
};

export default AppSessionManager;
