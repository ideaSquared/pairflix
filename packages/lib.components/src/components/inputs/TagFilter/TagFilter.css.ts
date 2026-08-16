import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const filterContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  margin: '1rem 0',
});

export const tagFilterButton = recipe({
  base: {
    borderRadius: vars.borderRadius.sm,
    padding: '0.25rem 0.75rem',
    fontSize: vars.typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '@media': {
      '(max-width: 768px)': {
        padding: '0.15rem 0.5rem',
        fontSize: vars.typography.fontSize.xs,
      },
    },
  },
  variants: {
    active: {
      true: {
        background: vars.colors.primary,
        color: 'white',
        border: `1px solid ${vars.colors.primary}`,
        selectors: {
          '&:hover': { background: vars.colors.primaryHover },
        },
      },
      false: {
        background: vars.colors.background.secondary,
        color: vars.colors.text.primary,
        border: `1px solid ${vars.colors.border}`,
        selectors: {
          '&:hover': { background: vars.colors.border },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

// Layered onto tagFilterButton's own class -- the original extended the
// styled-component (`styled(TagFilterButton)`) purely to add font-weight.
export const allButton = style({
  fontWeight: 'bold',
});

export const clearButton = style({
  background: 'transparent',
  color: vars.colors.text.secondary,
  border: 'none',
  padding: '0.25rem 0.5rem',
  fontSize: vars.typography.fontSize.sm,
  cursor: 'pointer',
  textDecoration: 'underline',
  selectors: {
    '&:hover': { color: vars.colors.text.primary },
  },
  '@media': {
    '(max-width: 768px)': {
      fontSize: vars.typography.fontSize.xs,
    },
  },
});
