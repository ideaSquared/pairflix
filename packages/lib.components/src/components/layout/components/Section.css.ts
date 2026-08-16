import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';
import { media } from '../utils/responsive';

// Each spacing variant redeclares itself at the desktop/tablet tiers (a
// no-op unless the component sets a `--section-spacing-{tier}` override)
// and downgrades to `mobileDefault` at the mobile tier, matching the
// original breakpoint behaviour.
const responsiveSpacing = (base: string, mobileDefault: string) => ({
  paddingTop: base,
  paddingBottom: base,
  '@media': {
    [media.desktop]: {
      paddingTop: `var(--section-spacing-desktop, ${base})`,
      paddingBottom: `var(--section-spacing-desktop, ${base})`,
    },
    [media.tablet]: {
      paddingTop: `var(--section-spacing-tablet, ${base})`,
      paddingBottom: `var(--section-spacing-tablet, ${base})`,
    },
    [media.mobile]: {
      paddingTop: `var(--section-spacing-mobile, ${mobileDefault})`,
      paddingBottom: `var(--section-spacing-mobile, ${mobileDefault})`,
    },
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
  },
  defaultVariants: {
    spacing: 'xl',
  },
});
