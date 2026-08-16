import clsx from 'clsx';
import React, { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuItem } from '../../overlay';
import { Container } from '../components/Container';
import { Flex } from '../components/Flex';
import { layoutTokens } from '../utils/responsive';
import {
  adminLayoutContainer,
  appLayoutContainer,
  dropdownIconContainer,
  footer as footerClass,
  header as headerClass,
  mainContent,
  mobileOverlay,
  navIconContainer,
  sidebar as sidebarClass,
  sidebarIconContainer,
  sidebarIconContainerBase,
  sidebarUserMenuTrigger,
  userMenuTrigger,
} from './AppLayout.css';

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
                      <span className={navIconContainer}>{item.icon}</span>
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
                    <button className={userMenuTrigger}>
                      {navigation.user.avatar}
                      <span>{navigation.user.name}</span>
                      <span style={{ fontSize: '0.75rem' }}>▼</span>
                    </button>
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
                          <span className={dropdownIconContainer}>
                            {menuItem.icon}
                          </span>
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
                  <span
                    className={clsx(
                      sidebarIconContainerBase,
                      sidebarIconContainer({ collapsed })
                    )}
                  >
                    {item.icon}
                  </span>
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
                <button className={sidebarUserMenuTrigger}>
                  {navigation.user.avatar}
                  <span style={{ flex: 1 }}>{navigation.user.name}</span>
                  <span style={{ fontSize: '0.75rem' }}>⋯</span>
                </button>
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
                      <span className={dropdownIconContainer}>
                        {menuItem.icon}
                      </span>
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
      <div className={clsx(adminLayoutContainer, className)}>
        {hasSidebar && (
          <>
            <aside
              className={sidebarClass({
                collapsed: sidebarCollapsed,
                persistent: mobileSidebarVisible,
              })}
            >
              <SidebarNavigation
                navigation={navigation!}
                collapsed={sidebarCollapsed}
                onToggleCollapse={
                  sidebar?.collapsible ? toggleSidebar : undefined
                }
              />
            </aside>
            {/* Backdrop dismiss target, not a focusable control -- the sidebar's own contents remain keyboard-navigable. */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              className={mobileOverlay({ visible: mobileSidebarVisible })}
              onClick={() => setMobileSidebarVisible(false)}
            />
          </>
        )}

        {header && (
          <header className={headerClass({ withSidebarOffset: hasSidebar })}>
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
          </header>
        )}

        <main
          className={mainContent({
            withSidebarOffset: hasSidebar,
            fullWidth,
          })}
        >
          {fullWidth ? children : <Container>{children}</Container>}
        </main>

        {footer?.show && (
          <footer className={footerClass}>
            <Container>{footer.content}</Container>
          </footer>
        )}
      </div>
    );
  }

  // Client variant
  return (
    <div className={clsx(appLayoutContainer, className)}>
      {hasNavigation && (
        <header className={headerClass()}>
          <TopNavigation
            navigation={navigation!}
            onMenuToggle={toggleMobileSidebar}
          />
        </header>
      )}

      <main className={mainContent({ fullWidth })}>
        {fullWidth ? children : <Container>{children}</Container>}
      </main>

      {footer?.show && (
        <footer className={footerClass}>
          <Container>{footer.content}</Container>
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
