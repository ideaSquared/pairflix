import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const tabContainer = style({
  display: 'flex',
  borderBottom: `1px solid ${vars.colors.border}`,
  marginBottom: vars.spacing.lg,
});

// `theme.colors.text` (with no sub-key) was a phantom path -- `text` is
// `{ primary, secondary, ... }`, not a single value -- mapped to the closest
// real token.
export const tab = recipe({
  base: {
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        color: vars.colors.primary,
      },
    },
  },
  variants: {
    active: {
      true: {
        fontWeight: 600,
        color: vars.colors.primary,
        borderBottom: `2px solid ${vars.colors.primary}`,
      },
      false: {
        fontWeight: 400,
        color: vars.colors.text.primary,
        borderBottom: '2px solid transparent',
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});
