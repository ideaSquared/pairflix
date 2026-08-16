import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const header = style({
  margin: 0,
  borderRadius: 0,
  background: vars.colors.background.secondary,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  selectors: {
    '&:hover': {
      transform: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
});

export const headerContent = style({
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: vars.spacing.md,
});

export const nav = style({
  display: 'flex',
  gap: vars.spacing.md,
});

export const navLink = recipe({
  base: {
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    selectors: {
      '&:hover': {
        color: vars.colors.primary,
      },
    },
  },
  variants: {
    active: {
      true: { color: vars.colors.primary },
      false: { color: vars.colors.text.primary },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const main = style({
  flex: 1,
  padding: `${vars.spacing.xl} 0`,
});
