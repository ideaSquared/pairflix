import {
  Card,
  H1,
  Typography,
  vars,
  type TypographyProps,
} from '@pairflix/components';
import React, { type CSSProperties, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Theme } from '../../styles/theme';
import * as styles from './Layout.css';

// ======== Layout Utility Components ========

export const breakpoints = styles.breakpoints;
export const media = styles.media;

// Define Grid component props
type GridProps = {
  columns?: number | string;
  gap?: keyof Theme['spacing'];
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'flex-start'
    | 'flex-end';
  mobileColumns?: number | string; // Mobile-specific columns
  tabletColumns?: number | string; // Tablet-specific columns
  desktopColumns?: number | string; // Desktop-specific columns
} & React.HTMLAttributes<HTMLDivElement>;

const colsValue = (columns: number | string) =>
  typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

export const Grid = ({
  columns = 1,
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  mobileColumns,
  tabletColumns,
  desktopColumns,
  className,
  style,
  children,
  ...rest
}: GridProps) => {
  const baseCols = colsValue(columns);
  const desktopCols =
    desktopColumns !== undefined ? colsValue(desktopColumns) : baseCols;
  const tabletCols =
    tabletColumns !== undefined
      ? colsValue(tabletColumns)
      : typeof columns === 'number'
        ? `repeat(${Math.min(columns, 2)}, 1fr)`
        : columns;
  const mobileCols =
    mobileColumns !== undefined ? colsValue(mobileColumns) : '1fr';

  return (
    <div
      className={`${styles.grid}${className ? ` ${className}` : ''}`}
      style={
        {
          '--grid-cols-base': baseCols,
          '--grid-cols-desktop': desktopCols,
          '--grid-cols-tablet': tabletCols,
          '--grid-cols-mobile': mobileCols,
          gap: vars.spacing[gap],
          alignItems,
          justifyContent,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};

type ContainerProps = {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
  padding?: keyof Theme['spacing'];
  fluid?: boolean; // Whether container should be fluid width
  centered?: boolean; // Whether container should be centered
  isFullWidth?: boolean; // Whether container should take full width of parent
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export const Container = ({
  maxWidth = 'lg',
  padding = 'md',
  fluid = false,
  centered = true,
  isFullWidth = true,
  children,
  className,
  style,
  ...rest
}: ContainerProps) => {
  const resolvedMaxWidth = fluid
    ? '100%'
    : maxWidth === 'none'
      ? 'none'
      : breakpoints[maxWidth];

  return (
    <div
      className={`${styles.container({ isFullWidth, centered, padding })}${className ? ` ${className}` : ''}`}
      style={{ maxWidth: resolvedMaxWidth, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

type FlexProps = {
  direction?: 'row' | 'column';
  gap?: keyof Theme['spacing'];
  alignItems?:
    'start' | 'center' | 'end' | 'stretch' | 'flex-start' | 'flex-end';
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'flex-start'
    | 'flex-end';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  mobileDirection?: 'row' | 'column'; // Direction on mobile
  tabletDirection?: 'row' | 'column'; // Direction on tablet
  mobileGap?: keyof Theme['spacing']; // Gap on mobile
  isFullWidth?: boolean; // Whether to take full width
  fullHeight?: boolean; // Whether to take full height
} & React.HTMLAttributes<HTMLDivElement>;

const mobileGapDowngrade = (
  gap: keyof Theme['spacing']
): keyof Theme['spacing'] => (gap === 'lg' || gap === 'xl' ? 'md' : gap);

export const Flex = ({
  direction = 'row',
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  wrap = 'nowrap',
  mobileDirection,
  tabletDirection,
  mobileGap,
  isFullWidth = false,
  fullHeight = false,
  className,
  style,
  children,
  ...rest
}: FlexProps) => (
  <div
    className={`${styles.flex}${className ? ` ${className}` : ''}`}
    style={
      {
        '--flex-direction-base': direction,
        '--flex-direction-tablet': tabletDirection || direction,
        '--flex-direction-mobile':
          mobileDirection || (direction === 'row' ? 'column' : direction),
        '--flex-gap-base': vars.spacing[gap],
        '--flex-gap-mobile': vars.spacing[mobileGap || mobileGapDowngrade(gap)],
        display: 'flex',
        alignItems,
        justifyContent,
        flexWrap: wrap,
        width: isFullWidth ? '100%' : 'auto',
        height: fullHeight ? '100%' : 'auto',
        ...style,
      } as CSSProperties
    }
    {...rest}
  >
    {children}
  </div>
);

type SpacerProps = {
  size: keyof Theme['spacing'];
  responsive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const spacerDowngrade = (
  size: keyof Theme['spacing']
): keyof Theme['spacing'] =>
  size === 'xl' || size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs';

export const Spacer = ({
  size,
  responsive,
  className,
  style,
  ...rest
}: SpacerProps) => (
  <div
    className={`${styles.spacer}${className ? ` ${className}` : ''}`}
    style={
      {
        '--spacer-size-base': vars.spacing[size],
        '--spacer-size-mobile':
          vars.spacing[responsive ? spacerDowngrade(size) : size],
        ...style,
      } as CSSProperties
    }
    {...rest}
  />
);

type SectionProps = {
  spacing?: keyof Theme['spacing'];
  isFullWidth?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export const Section = ({
  spacing = 'xl',
  isFullWidth = false,
  className,
  children,
  ...rest
}: SectionProps) => (
  <section
    className={`${styles.section({ spacing, isFullWidth })}${className ? ` ${className}` : ''}`}
    {...rest}
  >
    {children}
  </section>
);

// ======== Main Layout Component ========

const Header = ({ children }: { children: ReactNode }) => (
  <Card className={styles.header}>{children}</Card>
);

const HeaderContent = ({ children }: { children: ReactNode }) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    className={styles.headerContent}
  >
    {children}
  </Flex>
);

const AppTitle = ({ children }: { children: ReactNode }) => (
  <H1 className={styles.appTitle}>{children}</H1>
);

const Nav = ({ children }: { children: ReactNode }) => (
  <nav className={styles.nav}>{children}</nav>
);

const NavLink = ({
  active,
  className,
  ...rest
}: { active?: boolean } & TypographyProps) => (
  <Typography
    className={`${styles.navLink({ active })}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const MobileMenuButton = ({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={styles.mobileMenuButton} {...rest}>
    {children}
  </button>
);

const MobileMenuOverlay = ({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) => (
  // Decorative click-outside backdrop -- the menu itself has a proper
  // keyboard-accessible close button (MobileNavClose); this just mirrors
  // the original styled-components div's click-to-dismiss behavior.
  <div
    className={styles.mobileMenuOverlay({ open })}
    onClick={onClick}
    aria-hidden="true"
  />
);

const MobileMenuContainer = ({
  open,
  children,
  ...rest
}: {
  open: boolean;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={styles.mobileMenuContainer({ open })} {...rest}>
    {children}
  </div>
);

const MobileNavHeader = ({ children }: { children: ReactNode }) => (
  <div className={styles.mobileNavHeader}>{children}</div>
);

const MobileNavClose = ({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={styles.mobileNavClose} {...rest}>
    {children}
  </button>
);

const MobileNavLinks = ({ children }: { children: ReactNode }) => (
  <nav className={styles.mobileNavLinks}>{children}</nav>
);

const MobileNavLink = ({
  active,
  className,
  ...rest
}: { active?: boolean } & TypographyProps) => (
  <Typography
    className={`${styles.mobileNavLink({ active })}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const Main = ({ children }: { children: ReactNode }) => (
  <main className={styles.main}>{children}</main>
);

const Footer = ({ children }: { children: ReactNode }) => (
  <footer className={styles.footer}>{children}</footer>
);

const FooterContent = ({ children }: { children: ReactNode }) => (
  <Container fluid className={styles.footerContent}>
    {children}
  </Container>
);

const FooterLinks = ({ children }: { children: ReactNode }) => (
  <Flex mobileGap="sm">{children}</Flex>
);

const FooterLink = ({ children, ...rest }: TypographyProps) => (
  <Typography className={styles.footerLink} {...rest}>
    {children}
  </Typography>
);

const Copyright = ({ children }: { children: ReactNode }) => (
  <Typography className={styles.copyright}>{children}</Typography>
);

const AppTitleWrapper = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={styles.appTitleWrapper} {...rest}>
    {children}
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  isFullWidth?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isFullWidth = false,
  hideFooter = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const currentPath = window.location.pathname;

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation handler with mobile menu close
  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <Flex direction="column" className={styles.appShell}>
      <Header>
        <Container fluid>
          <HeaderContent>
            <AppTitleWrapper onClick={() => navigate('/')}>
              <AppTitle>PairFlix</AppTitle>
            </AppTitleWrapper>
            {isAuthenticated && (
              <>
                <Nav>
                  <NavLink
                    active={currentPath === '/watchlist'}
                    onClick={() => navigate('/watchlist')}
                  >
                    My Watchlist
                  </NavLink>
                  <NavLink
                    active={currentPath === '/matches'}
                    onClick={() => navigate('/matches')}
                  >
                    Matches
                  </NavLink>
                  <NavLink
                    active={currentPath === '/profile'}
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </NavLink>
                  <NavLink onClick={handleLogout}>Logout</NavLink>
                </Nav>

                {/* Mobile menu button */}
                <MobileMenuButton
                  onClick={toggleMobileMenu}
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  ☰
                </MobileMenuButton>

                {/* Mobile navigation menu */}
                <MobileMenuOverlay
                  open={mobileMenuOpen}
                  onClick={closeMobileMenu}
                />
                <MobileMenuContainer
                  open={mobileMenuOpen}
                  role="dialog"
                  aria-modal="true"
                >
                  <MobileNavHeader>
                    <AppTitle>PairFlix</AppTitle>
                    <MobileNavClose
                      onClick={closeMobileMenu}
                      aria-label="Close menu"
                    >
                      ×
                    </MobileNavClose>
                  </MobileNavHeader>
                  <MobileNavLinks>
                    <MobileNavLink
                      active={currentPath === '/watchlist'}
                      onClick={() => handleNavigate('/watchlist')}
                    >
                      My Watchlist
                    </MobileNavLink>
                    <MobileNavLink
                      active={currentPath === '/matches'}
                      onClick={() => handleNavigate('/matches')}
                    >
                      Matches
                    </MobileNavLink>
                    <MobileNavLink
                      active={currentPath === '/profile'}
                      onClick={() => handleNavigate('/profile')}
                    >
                      Profile
                    </MobileNavLink>
                    <MobileNavLink onClick={handleLogout}>Logout</MobileNavLink>
                  </MobileNavLinks>
                </MobileMenuContainer>
              </>
            )}
          </HeaderContent>
        </Container>
      </Header>
      <Main>
        <Container fluid={isFullWidth} maxWidth={isFullWidth ? 'none' : 'xxl'}>
          {children}
        </Container>
      </Main>

      {!hideFooter && (
        <Footer>
          <FooterContent>
            <Copyright>© 2025 PairFlix. All rights reserved.</Copyright>
            <FooterLinks>
              <FooterLink onClick={() => navigate('/terms')}>
                Terms of Service
              </FooterLink>
              <FooterLink onClick={() => navigate('/privacy')}>
                Privacy Policy
              </FooterLink>
              <FooterLink onClick={() => navigate('/contact')}>
                Contact Us
              </FooterLink>
            </FooterLinks>
          </FooterContent>
        </Footer>
      )}
    </Flex>
  );
};

export default Layout;
