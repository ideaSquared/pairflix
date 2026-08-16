// Layout components barrel file
// This exports components like Box, Container, Flex, Grid, Stack

// Export utility components
export * from './components/Container';
export * from './components/Flex';
export * from './components/Grid';
export * from './components/Section';
export * from './components/Spacer';

// Export new standardized layout components
export {
  AppLayout,
  type AppLayoutProps,
  type FooterConfig,
  type HeaderConfig,
  type NavigationConfig,
  type NavigationItem,
  type NavigationSection,
  type SidebarConfig,
} from './AppLayout/AppLayout';
export * from './PageContainer/PageContainer';

// Export responsive utilities (with explicit naming to avoid conflicts)
export {
  breakpoints,
  createContainerQuery,
  createResponsiveCSS,
  desktopFirst,
  getSpacing,
  hideOnDesktop,
  hideOnMobile,
  layoutTokens,
  media,
  mobileFirst,
  responsiveFontSize,
  responsiveSpacing,
  showOnlyDesktop,
  showOnlyMobile,
  type BreakpointKey,
  type ContainerConfig,
  type FlexConfig,
  type GridConfig,
  type ResponsiveValue,
  type SpacingValue,
} from './utils/responsive';
