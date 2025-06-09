import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { H3 } from '@pairflix/components';
import { useAuth } from '../hooks/useAuth';
import { Theme } from '../styles/theme';

// Styled components for the admin dashboard
const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const SidebarContainer = styled.aside<{ theme?: Theme }>`
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
  z-index: 10;
`;

const HeaderContainer = styled.header`
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
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.main`
  margin-left: 250px;
  padding: ${({ theme }) => theme.spacing.xl};
  padding-top: calc(64px + ${({ theme }) => theme.spacing.xl});
  flex-grow: 1;
  width: calc(100% - 250px);
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NavItem = styled(Link)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary.main : theme.colors.text.primary};
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.primary.main}20` : 'transparent'};
  text-decoration: none;
  font-weight: ${({ active }) => (active ? '600' : '400')};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme, active }) =>
      active
        ? `${theme.colors.primary.main}30`
        : `${theme.colors.background.hover}`};
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

const LogoContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
`;

const UserName = styled.span`
  margin-right: ${({ theme }) => theme.spacing.md};
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return '?';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <AdminContainer>
      <SidebarContainer>
        <LogoContainer>
          <H3>PairFlix Admin</H3>
        </LogoContainer>

        <NavSection>
          <NavItem to="/" active={isActive('/')}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </NavItem>
        </NavSection>

        <NavSectionTitle>Management</NavSectionTitle>
        <NavSection>
          <NavItem to="/users" active={isActive('/users')}>
            <i className="fas fa-users"></i> Users
          </NavItem>
          <NavItem to="/content" active={isActive('/content')}>
            <i className="fas fa-film"></i> Content
          </NavItem>
          <NavItem to="/activity" active={isActive('/activity')}>
            <i className="fas fa-chart-line"></i> Activity
          </NavItem>
          <NavItem to="/logs" active={isActive('/logs')}>
            <i className="fas fa-clipboard-list"></i> Audit Logs
          </NavItem>
        </NavSection>

        <NavSectionTitle>System</NavSectionTitle>
        <NavSection>
          <NavItem to="/monitoring" active={isActive('/monitoring')}>
            <i className="fas fa-heartbeat"></i> Monitoring
          </NavItem>
          <NavItem to="/stats" active={isActive('/stats')}>
            <i className="fas fa-chart-bar"></i> Statistics
          </NavItem>
          <NavItem to="/settings" active={isActive('/settings')}>
            <i className="fas fa-cog"></i> Settings
          </NavItem>

          {/* Test route for debugging */}
          <NavItem to="/test" active={isActive('/test')}>
            <i className="fas fa-vial"></i> Test Page
          </NavItem>
        </NavSection>
      </SidebarContainer>

      <HeaderContainer>
        <div>{/* Page title will be here */}</div>
        <UserContainer>
          <UserAvatar>{getUserInitials()}</UserAvatar>
          <UserName>{user?.username || 'Admin'}</UserName>
          <LogoutButton onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </LogoutButton>
        </UserContainer>
      </HeaderContainer>

      <MainContent>
        <Outlet />
      </MainContent>
    </AdminContainer>
  );
};

export default AdminLayout;
