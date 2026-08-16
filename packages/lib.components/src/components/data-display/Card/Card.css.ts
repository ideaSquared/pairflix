import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

// Card's own elevation scale -- distinct from (and more subtle than) the
// shared vars.shadows tokens, kept as literal values to match the original.
const ELEVATION = {
  low: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
  high: '0 8px 16px rgba(0, 0, 0, 0.2)',
} as const;

export const cardContainer = recipe({
  base: {
    padding: vars.spacing.lg,
    borderRadius: vars.borderRadius.md,
    overflow: 'hidden',
    marginBottom: vars.spacing.md,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: {
        padding: vars.spacing.md,
        marginBottom: vars.spacing.sm,
      },
    },
  },
  variants: {
    variant: {
      primary: {
        background: vars.colors.background.secondary,
        borderLeft: `4px solid ${vars.colors.primary}`,
      },
      secondary: {
        background: vars.colors.background.secondary,
        border: `1px solid ${vars.colors.border}`,
      },
      outlined: {
        background: 'transparent',
        border: `1px solid ${vars.colors.border}`,
      },
      stats: {
        background: vars.colors.background.secondary,
        border: `1px solid ${vars.colors.border}`,
      },
    },
    elevation: {
      low: { boxShadow: ELEVATION.low },
      medium: { boxShadow: ELEVATION.medium },
      high: { boxShadow: ELEVATION.high },
    },
    isInteractive: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: ELEVATION.medium,
          },
          '&:active': { transform: 'translateY(0)' },
          '&:focus-visible': {
            outline: `2px solid ${vars.colors.primary}`,
            outlineOffset: '2px',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'primary',
    elevation: 'low',
    isInteractive: false,
  },
});

export const statsCardContent = style({
  display: 'flex',
  flexDirection: 'column',
});

export const statsValue = style({
  fontSize: `calc(${vars.typography.fontSize.xl} * 1.5)`,
  fontWeight: vars.typography.fontWeight.bold,
  '@media': {
    [`(max-width: ${breakpoints.sm})`]: {
      fontSize: vars.typography.fontSize.xl,
    },
  },
});

export const statsCaption = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.sm,
  marginTop: vars.spacing.xs,
  fontStyle: 'italic',
});

export const statsTitle = style({
  margin: `0 0 ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.md,
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.secondary,
});
