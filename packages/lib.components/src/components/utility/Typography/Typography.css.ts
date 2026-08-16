import { globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

// No token for a monospace stack exists in the theme contract (this is the
// `code` variant's font-family fix -- see Typography.tsx) so it's a literal.
const MONOSPACE_FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

export const typography = recipe({
  base: {
    margin: 0,
    color: vars.colors.text.primary,
    fontWeight: 'inherit',
  },
  variants: {
    variant: {
      h1: {
        fontSize: `calc(${vars.typography.fontSize.xl} * 1.5)`,
        fontWeight: vars.typography.fontWeight.bold,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        '@media': {
          [`(max-width: ${breakpoints.md})`]: {
            fontSize: `calc(${vars.typography.fontSize.lg} * 1.5)`,
          },
          [`(max-width: ${breakpoints.sm})`]: {
            fontSize: vars.typography.fontSize.xl,
            lineHeight: 1.3,
          },
        },
      },
      h2: {
        fontSize: `calc(${vars.typography.fontSize.xl} * 1.2)`,
        fontWeight: vars.typography.fontWeight.bold,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        '@media': {
          [`(max-width: ${breakpoints.md})`]: {
            fontSize: `calc(${vars.typography.fontSize.lg} * 1.2)`,
          },
          [`(max-width: ${breakpoints.sm})`]: {
            fontSize: vars.typography.fontSize.lg,
            lineHeight: 1.4,
          },
        },
      },
      h3: {
        fontSize: vars.typography.fontSize.xl,
        fontWeight: vars.typography.fontWeight.bold,
        lineHeight: 1.4,
        '@media': {
          [`(max-width: ${breakpoints.sm})`]: {
            fontSize: vars.typography.fontSize.lg,
          },
        },
      },
      h4: {
        fontSize: `calc(${vars.typography.fontSize.md} * 1.1)`,
        fontWeight: vars.typography.fontWeight.medium,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: vars.typography.fontSize.md,
        fontWeight: vars.typography.fontWeight.medium,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: vars.typography.fontSize.sm,
        fontWeight: vars.typography.fontWeight.medium,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: vars.typography.fontSize.md,
        lineHeight: 1.5,
        '@media': {
          [`(max-width: ${breakpoints.sm})`]: { lineHeight: 1.6 },
        },
      },
      body2: {
        fontSize: vars.typography.fontSize.sm,
        lineHeight: 1.5,
        '@media': {
          [`(max-width: ${breakpoints.sm})`]: { lineHeight: 1.6 },
        },
      },
      caption: {
        fontSize: vars.typography.fontSize.xs,
        color: vars.colors.text.secondary,
        lineHeight: 1.5,
      },
      error: {
        fontSize: vars.typography.fontSize.sm,
        color: vars.colors.text.error,
        lineHeight: 1.5,
      },
      success: {
        fontSize: vars.typography.fontSize.sm,
        color: vars.colors.text.success,
        lineHeight: 1.5,
      },
      overline: {
        fontSize: vars.typography.fontSize.xs,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        lineHeight: 1.5,
      },
      code: {
        fontFamily: MONOSPACE_FONT_STACK,
        fontSize: vars.typography.fontSize.sm,
        padding: vars.spacing.xs,
        background: vars.colors.background.secondary,
        borderRadius: vars.borderRadius.sm,
        lineHeight: 1.5,
      },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
      justify: { textAlign: 'justify' },
    },
    gutterBottom: {
      true: {
        marginBottom: vars.spacing.md,
        '@media': {
          [`(max-width: ${breakpoints.sm})`]: { marginBottom: vars.spacing.sm },
        },
      },
      false: { marginBottom: 0 },
    },
    truncate: {
      true: {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      false: {},
    },
    noWrap: {
      true: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      false: {},
    },
    uppercase: {
      true: { textTransform: 'uppercase' },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'body1',
    align: 'left',
    gutterBottom: false,
    truncate: false,
    noWrap: false,
    uppercase: false,
  },
});

// Nested-selector styles for links inside typography content -- `selectors`
// only allows rules that target `&` itself, so descendant selectors like
// `a` go through globalStyle against the recipe's (always-applied) base class.
const typographyBase = typography.classNames.base;

globalStyle(`${typographyBase} a`, {
  color: vars.colors.primary,
  textDecoration: 'none',
  fontWeight: vars.typography.fontWeight.medium,
  transition: 'color 0.2s ease, text-decoration 0.2s ease',
});

globalStyle(`${typographyBase} a:hover`, {
  textDecoration: 'underline',
  color: vars.colors.primaryHover,
});

globalStyle(`${typographyBase} a:focus-visible`, {
  outline: `2px solid ${vars.colors.primary}`,
  outlineOffset: '2px',
  borderRadius: '2px',
});
