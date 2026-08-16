import { H1 } from '@pairflix/components';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import * as styles from './Header.css';

const Header: React.FC = () => {
  const { settings, isLoading } = useSettings();
  const { user, logout } = useAuth();

  return (
    <header className={styles.headerContainer}>
      <H1 className={styles.logo}>
        {isLoading ? 'Loading...' : settings?.general.siteName || 'PairFlix'}{' '}
        Admin
      </H1>
      <nav className={styles.navigation}>
        <Link className={styles.navLink} to="/">
          Dashboard
        </Link>
        <Link className={styles.navLink} to="/users">
          Users
        </Link>
        <Link className={styles.navLink} to="/content">
          Content
        </Link>
        <Link className={styles.navLink} to="/monitoring">
          Monitoring
        </Link>
        <Link className={styles.navLink} to="/activity">
          Activity
        </Link>
        <Link className={styles.navLink} to="/logs">
          Logs
        </Link>
        <Link className={styles.navLink} to="/stats">
          Stats
        </Link>
        <Link className={styles.navLink} to="/settings">
          Settings
        </Link>
        {user && (
          <Link
            className={styles.navLink}
            to="#"
            onClick={e => {
              e.preventDefault();
              logout();
            }}
          >
            Logout
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
