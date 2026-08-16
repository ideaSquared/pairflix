import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

// This file's own breakpoint/media scale -- distinct from (and pre-dating)
// the shared `themeBreakpoints` from `@pairflix/components`. Re-exported
// from Layout.tsx so it stays this module's public surface.
export const breakpoints = {
  xs: '375px', // Small mobile
  sm: '576px', // Mobile
  md: '768px', // Tablet
  lg: '992px', // Small desktop
  xl: '1200px', // Desktop
  xxl: '1600px', // Large desktop
};

export const media = {
  mobile: `(max-width: ${breakpoints.sm})`,
  tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  largeDesktop: `(min-width: ${breakpoints.xxl})`,
};

// ======== Grid ========
// `grid-template-columns` is fully prop-driven at every tier, so the
// component computes the effective value for each tier in JS and hands it
// down as a custom property -- see Grid.tsx. `desktop` already covers the
// `largeDesktop` range too (min-width: 1600px is a subset of min-width:
// 992px) and both resolved to the same formula in the original, so that
// tier was redundant and is folded into `desktop`.
export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'var(--grid-cols-base)',
  '@media': {
    [media.desktop]: { gridTemplateColumns: 'var(--grid-cols-desktop)' },
    [media.tablet]: { gridTemplateColumns: 'var(--grid-cols-tablet)' },
    [media.mobile]: { gridTemplateColumns: 'var(--grid-cols-mobile)' },
  },
});

// ======== Container ========
export const container = recipe({
  variants: {
    isFullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
    centered: {
      true: { marginLeft: 'auto', marginRight: 'auto' },
      false: { marginLeft: '0', marginRight: '0' },
    },
    padding: {
      xs: {
        paddingLeft: vars.spacing.xs,
        paddingRight: vars.spacing.xs,
        '@media': {
          [media.mobile]: {
            paddingLeft: vars.spacing.xs,
            paddingRight: vars.spacing.xs,
          },
        },
      },
      sm: {
        paddingLeft: vars.spacing.sm,
        paddingRight: vars.spacing.sm,
        '@media': {
          [media.mobile]: {
            paddingLeft: vars.spacing.sm,
            paddingRight: vars.spacing.sm,
          },
        },
      },
      md: {
        paddingLeft: vars.spacing.md,
        paddingRight: vars.spacing.md,
        '@media': {
          [media.mobile]: {
            paddingLeft: vars.spacing.sm,
            paddingRight: vars.spacing.sm,
          },
        },
      },
      lg: {
        paddingLeft: vars.spacing.lg,
        paddingRight: vars.spacing.lg,
        '@media': {
          [media.mobile]: {
            paddingLeft: vars.spacing.sm,
            paddingRight: vars.spacing.sm,
          },
        },
      },
      xl: {
        paddingLeft: vars.spacing.xl,
        paddingRight: vars.spacing.xl,
        '@media': {
          [media.mobile]: {
            paddingLeft: vars.spacing.sm,
            paddingRight: vars.spacing.sm,
          },
        },
      },
    },
  },
  defaultVariants: {
    isFullWidth: true,
    centered: true,
    padding: 'md',
  },
});

// ======== Flex ========
// `flexDirection`/`gap` are read from custom properties (computed per-tier
// in JS -- see Flex.tsx) so a wrapper class can still override them for a
// specific instance (e.g. FooterLinks); the remaining props are simple
// enough to apply directly as inline style instead.
export const flex = style({
  flexDirection: 'var(--flex-direction-base)',
  gap: 'var(--flex-gap-base)',
  '@media': {
    [media.tablet]: { flexDirection: 'var(--flex-direction-tablet)' },
    [media.mobile]: {
      flexDirection: 'var(--flex-direction-mobile)',
      gap: 'var(--flex-gap-mobile)',
    },
  },
});

// ======== Spacer ========
// Mobile always reads its own custom property; when `responsive` is false
// the component just sets it equal to the base size (see Spacer in
// Layout.tsx), so nothing visually changes even though the query fires.
export const spacer = style({
  height: 'var(--spacer-size-base)',
  width: 'var(--spacer-size-base)',
  '@media': {
    [media.mobile]: {
      height: 'var(--spacer-size-mobile)',
      width: 'var(--spacer-size-mobile)',
    },
  },
});

// ======== Section ========
const responsiveSpacing = (base: string, mobileValue: string) => ({
  paddingTop: base,
  paddingBottom: base,
  '@media': {
    [media.mobile]: { paddingTop: mobileValue, paddingBottom: mobileValue },
  },
});

export const section = recipe({
  variants: {
    spacing: {
      xs: responsiveSpacing(vars.spacing.xs, vars.spacing.xs),
      sm: responsiveSpacing(vars.spacing.sm, vars.spacing.sm),
      md: responsiveSpacing(vars.spacing.md, vars.spacing.md),
      lg: responsiveSpacing(vars.spacing.lg, vars.spacing.md),
      xl: responsiveSpacing(vars.spacing.xl, vars.spacing.lg),
    },
    isFullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
  },
  defaultVariants: {
    spacing: 'xl',
    isFullWidth: false,
  },
});

// ======== Main layout shell ========

export const appShell = style({
  minHeight: '100vh',
  width: '100%',
});

export const header = style({
  margin: 0,
  borderRadius: 0,
  background: vars.colors.background.secondary,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  width: '100%',
  selectors: {
    '&:hover': {
      transform: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
});

export const headerContent = style({
  padding: vars.spacing.md,
  '@media': {
    [media.mobile]: { padding: `${vars.spacing.sm} ${vars.spacing.md}` },
  },
});

export const appTitle = style({
  fontSize: vars.typography.fontSize.xl,
  margin: 0,
  '@media': {
    [media.mobile]: { fontSize: vars.typography.fontSize.lg },
  },
});

// `Nav` hides at the `md` breakpoint -- Flex always renders `display: flex`
// as an unconditional inline style, which a wrapper class can never beat, so
// this is a small dedicated element instead of a styled Flex.
export const nav = style({
  display: 'flex',
  gap: vars.spacing.md,
  '@media': {
    [`(max-width: ${breakpoints.md})`]: { display: 'none' },
  },
});

export const mobileMenuButton = style({
  display: 'none',
  background: 'none',
  border: 'none',
  color: vars.colors.text.primary,
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': { background: vars.colors.background.hover },
    '&:focus': { outline: `2px solid ${vars.colors.primary}` },
  },
  '@media': {
    [`(max-width: ${breakpoints.md})`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
});

export const mobileMenuOverlay = recipe({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 150,
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
  },
  variants: {
    open: {
      true: { opacity: 1, visibility: 'visible' },
      false: { opacity: 0, visibility: 'hidden' },
    },
  },
  defaultVariants: { open: false },
});

export const mobileMenuContainer = recipe({
  base: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    maxWidth: '320px',
    background: vars.colors.background.primary,
    zIndex: 200,
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    padding: `${vars.spacing.lg} 0`,
  },
  variants: {
    open: {
      true: { transform: 'translateX(0)' },
      false: { transform: 'translateX(100%)' },
    },
  },
  defaultVariants: { open: false },
});

export const mobileNavHeader = style({
  padding: `0 ${vars.spacing.md} ${vars.spacing.md}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${vars.colors.border}`,
});

export const mobileNavClose = style({
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: vars.colors.text.primary,
  cursor: 'pointer',
  padding: vars.spacing.xs,
});

export const mobileNavLinks = style({
  display: 'flex',
  flexDirection: 'column',
  padding: vars.spacing.md,
  flex: 1,
});

export const mobileNavLink = recipe({
  base: {
    padding: `${vars.spacing.md} 0`,
    cursor: 'pointer',
    borderBottom: `1px solid ${vars.colors.border}`,
    selectors: {
      '&:last-child': { borderBottom: 'none', marginTop: 'auto' },
      '&:hover': { color: vars.colors.primary },
    },
  },
  variants: {
    active: {
      true: {
        color: vars.colors.primary,
        fontWeight: vars.typography.fontWeight.bold,
      },
      false: {
        color: vars.colors.text.primary,
        fontWeight: vars.typography.fontWeight.medium,
      },
    },
  },
  defaultVariants: { active: false },
});

export const navLink = recipe({
  base: {
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    selectors: {
      '&:hover': { color: vars.colors.primary },
    },
  },
  variants: {
    active: {
      true: {
        color: vars.colors.primary,
        fontWeight: vars.typography.fontWeight.bold,
      },
      false: {
        color: vars.colors.text.primary,
        fontWeight: vars.typography.fontWeight.medium,
      },
    },
  },
  defaultVariants: { active: false },
});

export const main = style({
  flex: 1,
  width: '100%',
  padding: `${vars.spacing.xl} 0`,
  '@media': {
    [media.mobile]: { padding: `${vars.spacing.md} 0` },
  },
});

export const footer = style({
  background: vars.colors.background.secondary,
  padding: `${vars.spacing.lg} 0`,
  marginTop: 'auto',
  '@media': {
    [media.mobile]: { padding: `${vars.spacing.md} 0` },
  },
});

export const footerContent = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '@media': {
    [media.mobile]: {
      flexDirection: 'column',
      gap: vars.spacing.md,
      textAlign: 'center',
    },
  },
});

export const footerLink = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.sm,
  cursor: 'pointer',
  selectors: {
    '&:hover': { color: vars.colors.primary },
  },
});

export const copyright = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.sm,
});

export const appTitleWrapper = style({
  cursor: 'pointer',
});
