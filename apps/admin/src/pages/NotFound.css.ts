import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const notFoundContainer = style({
  textAlign: 'center',
  padding: vars.spacing.xl,
});

export const notFoundText = style({
  margin: `${vars.spacing.lg} 0`,
  fontSize: '1.1rem',
  color: vars.colors.text.secondary,
});

export const backLink = style({
  display: 'inline-block',
  color: vars.colors.primary,
  textDecoration: 'none',
  marginTop: vars.spacing.md,
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});
