import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const link = recipe({
  base: {
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        textDecoration: 'underline',
        color: vars.colors.primary,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '2px',
      },
    },
  },
  variants: {
    colorVariant: {
      primary: { color: vars.colors.primary },
      secondary: { color: vars.colors.text.secondary },
      // No matching token for a "tertiary" text color; the original theme
      // access (theme.colors.text.tertiary) never resolved to a real value
      // either, so no color rule is set here and it inherits, same as before.
      tertiary: {},
      active: { color: vars.colors.primary },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.6,
        pointerEvents: 'none',
      },
      false: {
        cursor: 'pointer',
        opacity: 1,
        pointerEvents: 'auto',
      },
    },
  },
  defaultVariants: {
    colorVariant: 'primary',
    disabled: false,
  },
});
