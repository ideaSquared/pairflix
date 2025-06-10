import { Container, Flex, H3 } from '@pairflix/components';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../hooks/useAuth';
import { Theme } from '../../../styles/theme';

const AdminContainer = styled(Container)`
  padding: 0;
  max-width: none;
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const SidebarContainer = styled.div<{ theme?: Theme }>`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 100;
`;

const HeaderContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  left: 250px;
  height: 64px;
  z-index: 99;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.main`
  margin-left: 250px;
  padding: ${({ theme }) => theme.spacing.lg};
  padding-top: calc(64px + ${({ theme }) => theme.spacing.lg});
  flex-grow: 1;
  width: calc(100% - 250px);
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

// Change 'active' prop to '$active' to prevent it from being passed to the DOM
const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.text.primary};
  background-color: ${({ theme, $active }) =>
    $active ? `${theme.colors.primary}20` : 'transparent'};
  text-decoration: none;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? `${theme.colors.primary}30` : theme.colors.background.hover};
  }

  svg,
  i {
    margin-right: ${({ theme }) => theme.spacing.sm};
    font-size: 1rem;
  }
`;

const NavSectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: ${({ theme }) => theme.spacing.md} 0
    ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

const TokenStatus = styled.div<{ $status: 'good' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.75rem;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case 'good':
        return `${theme.colors.success || '#28a745'}20`;
      case 'warning':
        return `${theme.colors.warning || '#ffc107'}20`;
      case 'error':
        return `${theme.colors.error || '#dc3545'}20`;
      default:
        return 'transparent';
    }
  }};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'good':
        return theme.colors.success || '#28a745';
      case 'warning':
        return theme.colors.warning || '#ffc107';
      case 'error':
        return theme.colors.error || '#dc3545';
      default:
        return theme.colors.text.secondary;
    }
  }};
  cursor: ${({ $status }) => ($status === 'warning' ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  &:hover {
    opacity: ${({ $status }) => ($status === 'warning' ? '0.8' : '1')};
  }
`;

const StatusDot = styled.span<{ $status: 'good' | 'warning' | 'error' }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case 'good':
        return theme.colors.success || '#28a745';
      case 'warning':
        return theme.colors.warning || '#ffc107';
      case 'error':
        return theme.colors.error || '#dc3545';
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

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
    <AdminContainer>
      <SidebarContainer>
        <H3>Admin Dashboard</H3>
        <Flex direction="column" gap="sm">
          <NavItem to="/" $active={isActive('/')}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </NavItem>

          <NavSectionTitle>Management</NavSectionTitle>
          <NavItem to="/users" $active={isActive('/users')}>
            <i className="fas fa-users"></i> Users
          </NavItem>
          <NavItem to="/content" $active={isActive('/content')}>
            <i className="fas fa-film"></i> Content
          </NavItem>
          <NavItem to="/activity" $active={isActive('/activity')}>
            <i className="fas fa-chart-line"></i> Activity
          </NavItem>
          <NavItem to="/logs" $active={isActive('/logs')}>
            <i className="fas fa-clipboard-list"></i> Audit Logs
          </NavItem>

          <NavSectionTitle>System</NavSectionTitle>
          <NavItem to="/monitoring" $active={isActive('/monitoring')}>
            <i className="fas fa-heartbeat"></i> Monitoring
          </NavItem>
          <NavItem to="/stats" $active={isActive('/stats')}>
            <i className="fas fa-chart-bar"></i> Statistics
          </NavItem>
          <NavItem to="/settings" $active={isActive('/settings')}>
            <i className="fas fa-cog"></i> Settings
          </NavItem>
        </Flex>
      </SidebarContainer>

      <HeaderContainer>
        <div>{/* Page title space */}</div>
        <UserSection>
          <TokenStatus
            $status={getTokenStatus()}
            onClick={
              getTokenStatus() === 'warning' ? handleRefreshToken : undefined
            }
            title={
              getTokenStatus() === 'warning'
                ? 'Click to refresh session'
                : undefined
            }
          >
            <StatusDot $status={getTokenStatus()} />
            {getTokenStatusText()}
          </TokenStatus>

          <UserInfo>
            <UserName>{user?.username || 'Admin'}</UserName>
            <UserRole>{user?.role || 'admin'}</UserRole>
          </UserInfo>

          <LogoutButton onClick={handleLogout} title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </LogoutButton>
        </UserSection>
      </HeaderContainer>

      <MainContent>
        <Outlet />
      </MainContent>
    </AdminContainer>
  );
};

export default AdminLayout;
