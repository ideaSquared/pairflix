import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';
import { media } from '../utils/responsive';

// Each padding variant redeclares itself at the desktop/tablet tiers (a
// no-op unless the component sets a `--container-padding-{tier}` override)
// and downgrades to `mobileDefault` at the mobile tier, matching the
// original breakpoint behaviour.
const responsivePadding = (base: string, mobileDefault: string) => ({
  paddingLeft: base,
  paddingRight: base,
  '@media': {
    [media.desktop]: {
      paddingLeft: `var(--container-padding-desktop, ${base})`,
      paddingRight: `var(--container-padding-desktop, ${base})`,
    },
    [media.tablet]: {
      paddingLeft: `var(--container-padding-tablet, ${base})`,
      paddingRight: `var(--container-padding-tablet, ${base})`,
    },
    [media.mobile]: {
      paddingLeft: `var(--container-padding-mobile, ${mobileDefault})`,
      paddingRight: `var(--container-padding-mobile, ${mobileDefault})`,
    },
  },
});

export const container = recipe({
  base: {
    width: 'var(--container-width, auto)',
    '@media': {
      // Always full width on mobile, regardless of the width/isFullWidth props.
      [media.mobile]: { width: '100%' },
    },
  },
  variants: {
    centered: {
      true: { marginLeft: 'auto', marginRight: 'auto' },
      false: { marginLeft: '0', marginRight: '0' },
    },
    padding: {
      xs: responsivePadding(vars.spacing.xs, vars.spacing.xs),
      sm: responsivePadding(vars.spacing.sm, vars.spacing.sm),
      md: responsivePadding(vars.spacing.md, vars.spacing.md),
      lg: responsivePadding(vars.spacing.lg, vars.spacing.md),
      xl: responsivePadding(vars.spacing.xl, vars.spacing.md),
    },
  },
  defaultVariants: {
    centered: true,
    padding: 'md',
  },
});
