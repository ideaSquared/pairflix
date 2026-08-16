import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const refreshButton = style({
  marginBottom: vars.spacing.md,
});

export const lastUpdated = style({
  marginBottom: vars.spacing.md,
  color: vars.colors.text.secondary,
});

// Targets a descendant `<h3>` (rendered by the `H3` component inside), so it
// goes through globalStyle rather than `selectors`.
export const statsCard = style({});

globalStyle(`${statsCard} h3`, {
  marginBottom: vars.spacing.sm,
});

export const metric = style({
  marginBottom: vars.spacing.sm,
});

export const metricName = style({
  fontWeight: vars.typography.fontWeight.medium,
  marginBottom: vars.spacing.xs,
});

// `theme.colors.text` (with no sub-key) was a phantom path in the "neither
// warning nor critical" branch -- mapped to the closest real token.
export const metricValue = recipe({
  base: {
    fontSize: '1.5rem',
    fontWeight: vars.typography.fontWeight.bold,
    color: vars.colors.text.primary,
  },
  variants: {
    warning: {
      true: {},
      false: {},
    },
    critical: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { warning: true, critical: false },
      style: { color: vars.colors.text.warning },
    },
    {
      variants: { warning: false, critical: true },
      style: { color: vars.colors.text.error },
    },
    {
      variants: { warning: true, critical: true },
      style: { color: vars.colors.text.error },
    },
  ],
  defaultVariants: {
    warning: false,
    critical: false,
  },
});

export const metricChart = style({
  height: '160px',
  marginTop: vars.spacing.md,
});

export const retryButton = style({
  marginTop: vars.spacing.md,
});

export const detailedStatsGrid = style({
  marginTop: vars.spacing.lg,
});

export const sectionHeading = style({
  marginTop: vars.spacing.lg,
  marginBottom: vars.spacing.md,
});

export const alertMessage = style({
  fontWeight: vars.typography.fontWeight.bold,
});
