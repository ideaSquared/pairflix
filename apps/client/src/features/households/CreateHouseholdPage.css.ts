import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  maxWidth: '480px',
});
