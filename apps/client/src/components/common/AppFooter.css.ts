import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const footer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.md} 0`,
});

export const links = style({
  display: 'flex',
  gap: vars.spacing.md,
});
