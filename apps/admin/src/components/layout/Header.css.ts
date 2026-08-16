import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const headerContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: vars.spacing.md,
  backgroundColor: vars.colors.background.secondary,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const logo = style({
  margin: 0,
});

export const navigation = style({
  display: 'flex',
  gap: vars.spacing.md,
});

export const navLink = style({
  color: vars.colors.text.primary,
  textDecoration: 'none',
  fontWeight: vars.typography.fontWeight.medium,
  transition: 'color 0.2s ease-in-out',
  selectors: {
    '&:hover': {
      color: vars.colors.primary,
    },
  },
});
