import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { DropdownMenu, DropdownMenuItem } from '../../overlay';
import { Container } from '../components/Container';
import { Flex } from '../components/Flex';
import { layoutTokens, media } from '../utils/responsive';

// Navigation configuration types
export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

export interface NavigationConfig {
  sections: NavigationSection[];
  logo?: ReactNode;
  user?: {
    name: string;
    avatar?: ReactNode;
    initials?: string;
    menu?: NavigationItem[];
  };
}

export interface HeaderConfig {
  title?: string;
  actions?: ReactNode;
  showUser?: boolean;
}

export interface SidebarConfig {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  persistent?: boolean;
}

export interface FooterConfig {
  content?: ReactNode;
  show?: boolean;
}

export interface AppLayoutProps {
  /** Layout variant for different application types */
  variant: 'client' | 'admin';
  /** Main content */
  children: ReactNode;
  /** Navigation configuration */
  navigation?: NavigationConfig;
  /** Header configuration */
  header?: HeaderConfig;
  /** Sidebar configuration (admin variant only) */
  sidebar?: SidebarConfig;
  /** Footer configuration */
  footer?: FooterConfig;
  /** Full width content without container padding */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
}

// Styled components
const AppLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const AdminLayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const HeaderContainer = styled.header<{
  variant: 'client' | 'admin';
  hasSidebar?: boolean;
}>`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: ${layoutTokens.header.zIndex};
  height: ${layoutTokens.header.height};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${({ variant, hasSidebar }) =>
    variant === 'admin' &&
    hasSidebar &&
    css`
      margin-left: ${layoutTokens.sidebar.width};

      @media ${media.mobile} {
        margin-left: 0;
      }
    `}
`;

const SidebarContainer = styled.aside<{
  collapsed?: boolean;
  persistent?: boolean;
}>`
  width: ${({ collapsed }) =>
    collapsed
      ? layoutTokens.sidebar.collapsedWidth
      : layoutTokens.sidebar.width};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: ${layoutTokens.sidebar.zIndex};
  overflow-y: auto;
  transition: width 0.3s ease;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);

  @media ${media.mobile} {
    transform: ${({ persistent }) =>
      persistent ? 'translateX(0)' : 'translateX(-100%)'};
    width: ${layoutTokens.sidebar.width};
  }
`;

const MainContent = styled.main<{
  variant: 'client' | 'admin';
  hasSidebar?: boolean;
  fullWidth?: boolean;
}>`
  flex: 1;
  display: flex;
  flex-direction: column;

  ${({ variant, hasSidebar }) =>
    variant === 'admin' &&
    hasSidebar &&
    css`
      margin-left: ${layoutTokens.sidebar.width};

      @media ${media.mobile} {
        margin-left: 0;
      }
    `}

  ${({ fullWidth }) =>
    !fullWidth &&
    css`
      padding: ${layoutTokens.content.padding.desktop};

      @media ${media.tablet} {
        padding: ${layoutTokens.content.padding.tablet};
      }

      @media ${media.mobile} {
        padding: ${layoutTokens.content.padding.mobile};
      }
    `}
`;

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  margin-top: auto;

  @media ${media.mobile} {
    padding: ${({ theme }) => theme.spacing.md} 0;
  }
`;

const MobileOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${layoutTokens.sidebar.zIndex - 1};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  @media ${media.desktop} {
    display: none;
  }
`;

// Styled button for user menu trigger
const UserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm || '0.25rem'};
  transition: background-color 0.2s ease;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background.hover || 'rgba(0, 0, 0, 0.05)'};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main || '#0077cc'};
    outline-offset: 2px;
  }
`;

const SidebarUserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm || '0.25rem'};
  transition: background-color 0.2s ease;
  width: 100%;
  text-align: left;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background.hover || 'rgba(0, 0, 0, 0.05)'};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main || '#0077cc'};
    outline-offset: 2px;
  }
`;

// Styled containers for navigation icons
const NavIconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
    display: block;
  }
`;

const SidebarIconContainer = styled.span<{ $collapsed?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: ${({ $collapsed }) => ($collapsed ? '0' : '0.75rem')};
  flex-shrink: 0;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    display: block;
  }
`;

const DropdownIconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;

  svg {
    width: 1rem;
    height: 1rem;
    display: block;
  }
`;

// Sub-components
const TopNavigation: React.FC<{
  navigation: NavigationConfig;
  onMenuToggle?: () => void;
}> = ({ navigation, onMenuToggle }) => {
  const handleMenuItemClick = (item: NavigationItem) => {
    if (item.key === 'logout' && item.onSelect) {
      item.onSelect();
    }
  };

  return (
    <Container>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ height: layoutTokens.header.height }}
      >
        <Flex alignItems="center" gap="md">
          {navigation.logo}
          <nav>
            <Flex gap="md" alignItems="center">
              {navigation.sections.flatMap(section =>
                section.items.map(item => (
                  <Link
                    key={item.key}
                    to={item.path}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.icon && (
                      <NavIconContainer>{item.icon}</NavIconContainer>
                    )}
                    {item.label}
                  </Link>
                ))
              )}
            </Flex>
          </nav>
        </Flex>

        <Flex alignItems="center" gap="md">
          {navigation.user && (
            <Flex alignItems="center" gap="sm">
              {navigation.user.menu && navigation.user.menu.length > 0 ? (
                <DropdownMenu
                  trigger={
                    <UserMenuTrigger>
                      {navigation.user.avatar}
                      <span>{navigation.user.name}</span>
                      <span style={{ fontSize: '0.75rem' }}>▼</span>
                    </UserMenuTrigger>
                  }
                  align="end"
                  variant="elevated"
                  size="medium"
                >
                  {navigation.user.menu.map(menuItem => (
                    <DropdownMenuItem
                      key={menuItem.key}
                      icon={
                        menuItem.icon ? (
                          <DropdownIconContainer>
                            {menuItem.icon}
                          </DropdownIconContainer>
                        ) : undefined
                      }
                      variant={
                        menuItem.key === 'logout' ? 'destructive' : 'default'
                      }
                      onSelect={() => handleMenuItemClick(menuItem)}
                    >
                      {menuItem.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              ) : (
                <>
                  {navigation.user.avatar}
                  <span>{navigation.user.name}</span>
                </>
              )}
            </Flex>
          )}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
              className="mobile-menu-toggle"
            >
              ☰
            </button>
          )}
        </Flex>
      </Flex>
    </Container>
  );
};

const SidebarNavigation: React.FC<{
  navigation: NavigationConfig;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}> = ({ navigation, collapsed, onToggleCollapse }) => {
  const handleMenuItemClick = (item: NavigationItem) => {
    if (item.key === 'logout' && item.onSelect) {
      item.onSelect();
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {navigation.logo && (
        <div
          style={{
            marginBottom: '2rem',
            textAlign: collapsed ? 'center' : 'left',
          }}
        >
          {navigation.logo}
        </div>
      )}

      <nav style={{ flex: 1 }}>
        {navigation.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '1.5rem' }}>
            {section.title && !collapsed && (
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                  opacity: 0.7,
                }}
              >
                {section.title}
              </div>
            )}
            {section.items.map(item => (
              <Link
                key={item.key}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '0.25rem',
                  borderRadius: '0.25rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {item.icon && (
                  <SidebarIconContainer $collapsed={collapsed}>
                    {item.icon}
                  </SidebarIconContainer>
                )}
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User menu at the bottom of sidebar */}
      {navigation.user && !collapsed && (
        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            paddingTop: '1rem',
          }}
        >
          {navigation.user.menu && navigation.user.menu.length > 0 ? (
            <DropdownMenu
              trigger={
                <SidebarUserMenuTrigger>
                  {navigation.user.avatar}
                  <span style={{ flex: 1 }}>{navigation.user.name}</span>
                  <span style={{ fontSize: '0.75rem' }}>⋯</span>
                </SidebarUserMenuTrigger>
              }
              align="start"
              side="top"
              variant="elevated"
              size="medium"
            >
              {navigation.user.menu.map(menuItem => (
                <DropdownMenuItem
                  key={menuItem.key}
                  icon={
                    menuItem.icon ? (
                      <DropdownIconContainer>
                        {menuItem.icon}
                      </DropdownIconContainer>
                    ) : undefined
                  }
                  variant={
                    menuItem.key === 'logout' ? 'destructive' : 'default'
                  }
                  onSelect={() => handleMenuItemClick(menuItem)}
                >
                  {menuItem.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
              }}
            >
              {navigation.user.avatar}
              <span>{navigation.user.name}</span>
            </div>
          )}
        </div>
      )}

      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      )}
    </div>
  );
};

/**
 * AppLayout - Unified layout component for both client and admin applications
 *
 * Features:
 * - Configurable navigation patterns (top bar vs sidebar)
 * - Responsive behavior with mobile-first approach
 * - Theme integration and consistent styling
 * - Accessibility features built-in
 *
 * @example
 * // Client Application
 * <AppLayout variant="client" navigation={clientNavConfig}>
 *   <Routes>...</Routes>
 * </AppLayout>
 *
 * // Admin Application
 * <AppLayout variant="admin" navigation={adminNavConfig} sidebar={sidebarConfig}>
 *   <Routes>...</Routes>
 * </AppLayout>
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  variant,
  children,
  navigation,
  header,
  sidebar,
  footer,
  fullWidth = false,
  className,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    sidebar?.defaultCollapsed ?? false
  );
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () =>
    setMobileSidebarVisible(!mobileSidebarVisible);

  const hasNavigation = navigation && navigation.sections.length > 0;
  const hasSidebar = variant === 'admin' && hasNavigation;

  if (variant === 'admin') {
    return (
      <AdminLayoutContainer className={className}>
        {hasSidebar && (
          <>
            <SidebarContainer
              collapsed={sidebarCollapsed}
              persistent={mobileSidebarVisible}
            >
              <SidebarNavigation
                navigation={navigation!}
                collapsed={sidebarCollapsed}
                onToggleCollapse={
                  sidebar?.collapsible ? toggleSidebar : undefined
                }
              />
            </SidebarContainer>
            <MobileOverlay
              visible={mobileSidebarVisible}
              onClick={() => setMobileSidebarVisible(false)}
            />
          </>
        )}

        {header && (
          <HeaderContainer variant="admin" hasSidebar={hasSidebar}>
            <Container>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                style={{ height: layoutTokens.header.height }}
              >
                <div>{header.title}</div>
                <div>{header.actions}</div>
              </Flex>
            </Container>
          </HeaderContainer>
        )}

        <MainContent
          variant="admin"
          hasSidebar={hasSidebar}
          fullWidth={fullWidth}
        >
          {fullWidth ? children : <Container>{children}</Container>}
        </MainContent>

        {footer?.show && (
          <FooterContainer>
            <Container>{footer.content}</Container>
          </FooterContainer>
        )}
      </AdminLayoutContainer>
    );
  }

  // Client variant
  return (
    <AppLayoutContainer className={className}>
      {hasNavigation && (
        <HeaderContainer variant="client">
          <TopNavigation
            navigation={navigation!}
            onMenuToggle={toggleMobileSidebar}
          />
        </HeaderContainer>
      )}

      <MainContent variant="client" fullWidth={fullWidth}>
        {fullWidth ? children : <Container>{children}</Container>}
      </MainContent>

      {footer?.show && (
        <FooterContainer>
          <Container>{footer.content}</Container>
        </FooterContainer>
      )}
    </AppLayoutContainer>
  );
};

export default AppLayout;
