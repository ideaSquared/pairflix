import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const statsGrid = style({
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: vars.spacing.md,
  marginBottom: vars.spacing.lg,
});

export const logsTable = style({
  overflow: 'hidden',
});
