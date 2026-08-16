import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const section = style({
  marginBottom: vars.spacing.lg,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.spacing.md,
});

export const statsTable = style({
  overflow: 'hidden',
});
