import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const headerContainer = style({
  marginBottom: vars.spacing.lg,
});

export const headerTitle = style({
  fontSize: '1.75rem',
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  display: 'flex',
  alignItems: 'center',
});

export const iconWrapper = style({
  marginRight: vars.spacing.sm,
});
