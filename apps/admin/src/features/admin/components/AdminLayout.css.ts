import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const adminContainer = style({
  padding: 0,
  maxWidth: 'none',
  display: 'flex',
  minHeight: '100vh',
  position: 'relative',
});

export const sidebarContainer = style({
  width: '250px',
  backgroundColor: vars.colors.background.secondary,
  borderRight: `1px solid ${vars.colors.border}`,
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  padding: vars.spacing.md,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  overflowY: 'auto',
  zIndex: 100,
});

export const headerContainer = style({
  backgroundColor: vars.colors.background.secondary,
  borderBottom: `1px solid ${vars.colors.border}`,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  right: 0,
  left: '250px',
  height: '64px',
  zIndex: 99,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
});

export const mainContent = style({
  marginLeft: '250px',
  padding: vars.spacing.lg,
  paddingTop: `calc(64px + ${vars.spacing.lg})`,
  flexGrow: 1,
  width: 'calc(100% - 250px)',
  backgroundColor: vars.colors.background.primary,
});

// The icon-margin rule targets descendant `svg`/`i` tags, so it can't live in
// the `navItem` recipe's `selectors` (those can only target the element's own
// state) -- it's pinned to this always-present static class instead.
export const navItemBase = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  marginBottom: vars.spacing.xs,
  borderRadius: vars.borderRadius.sm,
  textDecoration: 'none',
  transition: 'all 0.2s ease-in-out',
});

globalStyle(`${navItemBase} svg, ${navItemBase} i`, {
  marginRight: vars.spacing.sm,
  fontSize: '1rem',
});

// `20`/`30` hex alpha suffixes (~12.5%/~19% of vars.colors.primary) become
// color-mix against the var() reference -- see color-mix note in Alert.css.ts.
export const navItem = recipe({
  base: {},
  variants: {
    active: {
      true: {
        color: vars.colors.primary,
        backgroundColor: `color-mix(in srgb, ${vars.colors.primary} 12.5%, transparent)`,
        fontWeight: 600,
        selectors: {
          '&:hover': {
            backgroundColor: `color-mix(in srgb, ${vars.colors.primary} 19%, transparent)`,
          },
        },
      },
      false: {
        color: vars.colors.text.primary,
        backgroundColor: 'transparent',
        fontWeight: 400,
        selectors: {
          '&:hover': {
            backgroundColor: vars.colors.background.hover,
          },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const navSectionTitle = style({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: vars.colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: `${vars.spacing.md} 0 ${vars.spacing.xs}`,
  padding: `0 ${vars.spacing.md}`,
});

export const userSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const userInfo = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  marginRight: vars.spacing.sm,
});

export const userName = style({
  fontSize: '0.9rem',
  fontWeight: 500,
  color: vars.colors.text.primary,
});

export const userRole = style({
  fontSize: '0.75rem',
  color: vars.colors.text.secondary,
  textTransform: 'uppercase',
});

// `20` hex alpha suffix (~12.5%) becomes color-mix against the var() reference.
export const tokenStatus = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    fontSize: '0.75rem',
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    borderRadius: vars.borderRadius.sm,
    transition: 'all 0.2s ease',
  },
  variants: {
    status: {
      good: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.success} 12.5%, transparent)`,
        color: vars.colors.text.success,
        cursor: 'default',
        selectors: { '&:hover': { opacity: 1 } },
      },
      warning: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.warning} 12.5%, transparent)`,
        color: vars.colors.text.warning,
        cursor: 'pointer',
        selectors: { '&:hover': { opacity: 0.8 } },
      },
      error: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.error} 12.5%, transparent)`,
        color: vars.colors.text.error,
        cursor: 'default',
        selectors: { '&:hover': { opacity: 1 } },
      },
    },
  },
  defaultVariants: {
    status: 'good',
  },
});

export const statusDot = recipe({
  base: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  variants: {
    status: {
      good: { backgroundColor: vars.colors.text.success },
      warning: { backgroundColor: vars.colors.text.warning },
      error: { backgroundColor: vars.colors.text.error },
    },
  },
  defaultVariants: {
    status: 'good',
  },
});

export const logoutButton = style({
  background: 'none',
  border: 'none',
  color: vars.colors.text.secondary,
  cursor: 'pointer',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.background.hover,
      color: vars.colors.text.primary,
    },
  },
});
