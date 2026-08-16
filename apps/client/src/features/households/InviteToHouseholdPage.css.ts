import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  maxWidth: '480px',
});

export const linkBox = style({
  display: 'block',
  padding: vars.spacing.sm,
  background: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.sm,
  wordBreak: 'break-all',
});
