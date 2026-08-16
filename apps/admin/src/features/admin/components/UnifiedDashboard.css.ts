import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const tabContainer = style({
  display: 'flex',
  gap: vars.spacing.sm,
  marginBottom: vars.spacing.lg,
  borderBottom: `1px solid ${vars.colors.border}`,
  paddingBottom: vars.spacing.md,
});

export const tabButton = recipe({
  base: {},
  variants: {
    active: {
      true: {
        opacity: 1,
        fontWeight: vars.typography.fontWeight.bold,
        background: vars.colors.background.highlight,
      },
      false: {
        opacity: 0.7,
        fontWeight: vars.typography.fontWeight.normal,
        background: 'transparent',
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const pageHeader = style({
  marginBottom: vars.spacing.lg,
});
