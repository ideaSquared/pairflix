import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const statsGrid = style({
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: vars.spacing.md,
  marginBottom: vars.spacing.lg,
});

export const activityTable = style({
  overflow: 'hidden',
});

export const sectionHeader = style({
  marginTop: vars.spacing.lg,
  marginBottom: vars.spacing.md,
});

export const todayButton = style({
  marginRight: '8px',
});

// `10` hex alpha suffix (~6%) becomes color-mix against the var() reference.
export const tableRow = recipe({
  base: {
    selectors: {
      '&:hover': {
        backgroundColor: vars.colors.background.secondary,
      },
    },
  },
  variants: {
    isToday: {
      true: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.primary} 6%, transparent)`,
      },
      false: {
        backgroundColor: 'transparent',
      },
    },
  },
  defaultVariants: {
    isToday: false,
  },
});
