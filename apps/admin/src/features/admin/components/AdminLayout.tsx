import { Container, Flex, H3 } from '@pairflix/components';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import * as styles from './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout, refreshToken, isTokenNearExpiry } = useAuth();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Handle manual token refresh
  const handleRefreshToken = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  // Get token status
  const getTokenStatus = (): 'good' | 'warning' | 'error' => {
    if (!user) return 'error';
    if (isTokenNearExpiry()) return 'warning';
    return 'good';
  };

  const getTokenStatusText = (): string => {
    const status = getTokenStatus();
    switch (status) {
      case 'good':
        return 'Session Active';
      case 'warning':
        return 'Session Expiring';
      case 'error':
        return 'Session Invalid';
    }
  };

  return (
    <Container className={styles.adminContainer}>
      <div className={styles.sidebarContainer}>
        <H3>Admin Dashboard</H3>
        <Flex direction="column" gap="sm">
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/') })}`}
            to="/"
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>

          <div className={styles.navSectionTitle}>Management</div>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/users') })}`}
            to="/users"
          >
            <i className="fas fa-users"></i> Users
          </Link>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/content') })}`}
            to="/content"
          >
            <i className="fas fa-film"></i> Content
          </Link>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/activity') })}`}
            to="/activity"
          >
            <i className="fas fa-chart-line"></i> Activity
          </Link>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/logs') })}`}
            to="/logs"
          >
            <i className="fas fa-clipboard-list"></i> Audit Logs
          </Link>

          <div className={styles.navSectionTitle}>System</div>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/monitoring') })}`}
            to="/monitoring"
          >
            <i className="fas fa-heartbeat"></i> Monitoring
          </Link>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/stats') })}`}
            to="/stats"
          >
            <i className="fas fa-chart-bar"></i> Statistics
          </Link>
          <Link
            className={`${styles.navItemBase} ${styles.navItem({ active: isActive('/settings') })}`}
            to="/settings"
          >
            <i className="fas fa-cog"></i> Settings
          </Link>
        </Flex>
      </div>

      <div className={styles.headerContainer}>
        <div>{/* Page title space */}</div>
        <div className={styles.userSection}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events -- pre-existing click-to-refresh affordance carried over unchanged from the prior CSS-in-JS version (its capitalized wrapper tag name shielded it from this lint rule; converting to a plain div is a styling-engine swap, not a behavior change) */}
          <div
            className={styles.tokenStatus({ status: getTokenStatus() })}
            onClick={
              getTokenStatus() === 'warning' ? handleRefreshToken : undefined
            }
            title={
              getTokenStatus() === 'warning'
                ? 'Click to refresh session'
                : undefined
            }
          >
            <span className={styles.statusDot({ status: getTokenStatus() })} />
            {getTokenStatusText()}
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.username || 'Admin'}</span>
            <span className={styles.userRole}>{user?.role || 'admin'}</span>
          </div>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </Container>
  );
};

export default AdminLayout;
