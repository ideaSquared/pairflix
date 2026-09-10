import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const section = style({
  marginTop: vars.spacing.lg,
});

export const placeholder = style({
  fontStyle: 'italic',
});

export const list = style({
  paddingLeft: vars.spacing.lg,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});
