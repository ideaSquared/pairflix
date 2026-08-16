import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.spacing.xs,
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
});

export const separator = style({
  margin: `0 ${vars.spacing.xs}`,
  userSelect: 'none',
});

export const text = style({
  color: vars.colors.text.primary,
});

export const list = style({
  display: 'flex',
  alignItems: 'center',
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
});
