import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const item = style({
  display: 'inline-flex',
});

const chipBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius.sm,
  overflow: 'hidden',
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border}`,
} as const;

export const chip = style({
  ...chipBase,
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: '2px',
    },
  },
});

export const chipStatic = style(chipBase);

export const logo = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});
