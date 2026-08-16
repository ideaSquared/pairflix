import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const dashboardGrid = style({
  marginTop: vars.spacing.lg,
});

export const actionButtons = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
  marginTop: vars.spacing.lg,
});

export const sectionTitle = style({
  marginBottom: vars.spacing.md,
  marginTop: vars.spacing.lg,
});
