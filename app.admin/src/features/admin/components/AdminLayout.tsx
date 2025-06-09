import { Container, Flex, H3 } from '@pairflix/components';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
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

const MainContent = styled.main`
  margin-left: 250px;
  padding: ${({ theme }) => theme.spacing.lg};
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

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
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
      <MainContent>
        <Outlet />
      </MainContent>
    </AdminContainer>
  );
};

export default AdminLayout;
