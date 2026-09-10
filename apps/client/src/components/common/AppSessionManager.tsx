import { Alert, SessionManager } from '@pairflix/components';
import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import * as styles from './AppSessionManager.css';

const EXPIRE_MESSAGE =
  'Your session has expired due to inactivity. Please log in again.';

/**
 * App-specific wrapper for the shared SessionManager component. The idle timer itself only runs
 * for a signed-in visitor -- an anonymous one reading the landing page has no session to expire.
 * Stays mounted regardless of auth state so the expiry notice survives `logout()` flipping
 * `isAuthenticated` (which would otherwise unmount it before the notice was ever seen), and uses
 * an in-app Alert instead of a browser alert().
 */
const AppSessionManager: React.FC = () => {
  const { settings } = useSettings();
  const { logout, isAuthenticated } = useAuth();
  const [showExpiredNotice, setShowExpiredNotice] = useState(false);

  const handleSessionExpire = () => {
    setShowExpiredNotice(true);
    logout();
  };

  return (
    <>
      {showExpiredNotice && (
        <div className={styles.noticeContainer}>
          <Alert
            variant="warning"
            message={EXPIRE_MESSAGE}
            dismissible
            onDismiss={() => setShowExpiredNotice(false)}
          />
        </div>
      )}
      {isAuthenticated && (
        <SessionManager
          sessionTimeout={settings?.security.sessionTimeout}
          onSessionExpire={handleSessionExpire}
          showAlert={false}
        />
      )}
    </>
  );
};

export default AppSessionManager;
