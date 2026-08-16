import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const headerContainer = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: vars.spacing.md,
  backgroundColor: vars.colors.background.secondary,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '@media': {
    '(max-width: 768px)': {
      padding: vars.spacing.sm,
      flexWrap: 'wrap',
    },
  },
});

export const logo = style({
  margin: 0,
  '@media': {
    '(max-width: 768px)': { fontSize: vars.typography.fontSize.lg },
  },
});

export const navigation = recipe({
  base: {
    display: 'flex',
    gap: vars.spacing.md,
    '@media': {
      '(max-width: 768px)': {
        flexDirection: 'column',
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: vars.colors.background.secondary,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: vars.spacing.md,
        gap: vars.spacing.md,
        zIndex: 100,
        transition: 'top 0.3s ease-in-out',
      },
    },
  },
  variants: {
    isOpen: {
      true: {
        '@media': {
          '(max-width: 768px)': { top: '60px' },
        },
      },
      false: {
        '@media': {
          '(max-width: 768px)': { top: '-400px' },
        },
      },
    },
  },
  defaultVariants: {
    isOpen: false,
  },
});

export const navLink = style({
  color: vars.colors.text.primary,
  textDecoration: 'none',
  fontWeight: vars.typography.fontWeight.medium,
  transition: 'color 0.2s ease-in-out',
  selectors: {
    '&:hover': { color: vars.colors.primary },
  },
  '@media': {
    '(max-width: 768px)': {
      padding: `${vars.spacing.sm} 0`,
      borderBottom: `1px solid ${vars.colors.border}`,
      display: 'block',
      width: '100%',
    },
  },
});

export const menuButton = style({
  display: 'none',
  background: 'none',
  border: 'none',
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.lg,
  cursor: 'pointer',
  padding: vars.spacing.xs,
  '@media': {
    '(max-width: 768px)': { display: 'block' },
  },
});
