import { recipe } from '@vanilla-extract/recipes';
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { layoutTokens, media } from '../utils/responsive';

export const appLayoutContainer = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: vars.colors.background.primary,
});

export const adminLayoutContainer = style({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: vars.colors.background.primary,
});

// `withSidebarOffset` is true only for the admin variant when a sidebar is
// rendered (the only case the original margin-left rule ever applied).
export const header = recipe({
  base: {
    backgroundColor: vars.colors.background.secondary,
    borderBottom: `1px solid ${vars.colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: layoutTokens.header.zIndex,
    height: layoutTokens.header.height,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  variants: {
    withSidebarOffset: {
      true: {
        marginLeft: layoutTokens.sidebar.width,
        '@media': {
          [media.mobile]: { marginLeft: 0 },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    withSidebarOffset: false,
  },
});

export const sidebar = recipe({
  base: {
    backgroundColor: vars.colors.background.secondary,
    borderRight: `1px solid ${vars.colors.border}`,
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: layoutTokens.sidebar.zIndex,
    overflowY: 'auto',
    transition: 'width 0.3s ease',
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
  },
  variants: {
    collapsed: {
      true: { width: layoutTokens.sidebar.collapsedWidth },
      false: { width: layoutTokens.sidebar.width },
    },
    persistent: {
      true: {
        '@media': {
          [media.mobile]: {
            transform: 'translateX(0)',
            width: layoutTokens.sidebar.width,
          },
        },
      },
      false: {
        '@media': {
          [media.mobile]: {
            transform: 'translateX(-100%)',
            width: layoutTokens.sidebar.width,
          },
        },
      },
    },
  },
  defaultVariants: {
    collapsed: false,
    persistent: false,
  },
});

export const mainContent = recipe({
  base: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    withSidebarOffset: {
      true: {
        marginLeft: layoutTokens.sidebar.width,
        '@media': {
          [media.mobile]: { marginLeft: 0 },
        },
      },
      false: {},
    },
    fullWidth: {
      true: {},
      false: {
        padding: layoutTokens.content.padding.desktop,
        '@media': {
          [media.tablet]: { padding: layoutTokens.content.padding.tablet },
          [media.mobile]: { padding: layoutTokens.content.padding.mobile },
        },
      },
    },
  },
  defaultVariants: {
    withSidebarOffset: false,
    fullWidth: false,
  },
});

export const footer = style({
  backgroundColor: vars.colors.background.secondary,
  borderTop: `1px solid ${vars.colors.border}`,
  paddingTop: vars.spacing.lg,
  paddingBottom: vars.spacing.lg,
  marginTop: 'auto',
  '@media': {
    [media.mobile]: {
      paddingTop: vars.spacing.md,
      paddingBottom: vars.spacing.md,
    },
  },
});

export const mobileOverlay = recipe({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: layoutTokens.sidebar.zIndex - 1,
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    '@media': {
      [media.desktop]: { display: 'none' },
    },
  },
  variants: {
    visible: {
      true: { opacity: 1, visibility: 'visible' },
      false: { opacity: 0, visibility: 'hidden' },
    },
  },
  defaultVariants: {
    visible: false,
  },
});

const menuTriggerBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  transition: 'background-color 0.2s ease',
  color: 'inherit',
  ':hover': {
    backgroundColor: vars.colors.background.hover,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.colors.primary}`,
    outlineOffset: '2px',
  },
};

export const userMenuTrigger = style({
  ...menuTriggerBase,
  padding: '0.5rem',
});

export const sidebarUserMenuTrigger = style({
  ...menuTriggerBase,
  padding: '0.75rem',
  width: '100%',
  textAlign: 'left',
});

// `selectors` can only target the class itself (or another known class), so
// the unscoped `svg` descendant rules below go through `globalStyle`.
export const navIconContainer = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  marginRight: '0.5rem',
});

globalStyle(`${navIconContainer} svg`, {
  width: '1rem',
  height: '1rem',
  display: 'block',
});

export const sidebarIconContainerBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  flexShrink: 0,
});

globalStyle(`${sidebarIconContainerBase} svg`, {
  width: '1.25rem',
  height: '1.25rem',
  display: 'block',
});

export const sidebarIconContainer = recipe({
  base: {},
  variants: {
    collapsed: {
      true: { marginRight: '0' },
      false: { marginRight: '0.75rem' },
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});

export const dropdownIconContainer = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1rem',
  height: '1rem',
  flexShrink: 0,
});

globalStyle(`${dropdownIconContainer} svg`, {
  width: '1rem',
  height: '1rem',
  display: 'block',
});
