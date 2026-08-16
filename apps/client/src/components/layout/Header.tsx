import { H1 } from '@pairflix/components';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import * as styles from './Header.css';

const Header: React.FC = () => {
  const { settings, isLoading } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.headerContainer}>
      <H1 className={styles.logo}>
        {isLoading ? 'Loading...' : settings?.general.siteName || 'PairFlix'}
      </H1>

      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={styles.navigation({ isOpen: mobileMenuOpen })}>
        <Link className={styles.navLink} to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link className={styles.navLink} to="/matches" onClick={closeMenu}>
          Matches
        </Link>
        <Link className={styles.navLink} to="/watchlist" onClick={closeMenu}>
          Watchlist
        </Link>
        <Link className={styles.navLink} to="/activity" onClick={closeMenu}>
          Activity
        </Link>
        <Link className={styles.navLink} to="/profile" onClick={closeMenu}>
          Profile
        </Link>
        {/* Only show admin link if features are enabled */}
        {settings?.features.enableUserProfiles && (
          <Link className={styles.navLink} to="/admin" onClick={closeMenu}>
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
