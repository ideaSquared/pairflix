import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

export const select = recipe({
  base: {
    appearance: 'none',
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    background: vars.colors.background.input,
    color: vars.colors.text.primary,
    borderRadius: vars.borderRadius.sm,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    paddingRight: vars.spacing.xl,
    selectors: {
      '&:disabled': {
        backgroundColor: vars.colors.background.secondary,
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    },
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: {
        width: '100%',
        minHeight: '44px',
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
  variants: {
    isInvalid: {
      true: {
        border: `1px solid ${vars.colors.text.error}`,
        selectors: {
          '&:hover:not(:disabled)': { borderColor: vars.colors.text.error },
          '&:focus': {
            outline: 'none',
            borderColor: vars.colors.text.error,
            boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.text.error} 25%, transparent)`,
          },
          '&:focus-visible': {
            outline: `2px solid ${vars.colors.text.error}`,
            outlineOffset: '2px',
          },
        },
      },
      false: {
        border: `1px solid ${vars.colors.border}`,
        selectors: {
          '&:hover:not(:disabled)': { borderColor: vars.colors.primary },
          '&:focus': {
            outline: 'none',
            borderColor: vars.colors.primary,
            boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.primary} 25%, transparent)`,
          },
          '&:focus-visible': {
            outline: `2px solid ${vars.colors.primary}`,
            outlineOffset: '2px',
          },
        },
      },
    },
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        height: '32px',
        fontSize: vars.typography.fontSize.sm,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        height: '40px',
        fontSize: vars.typography.fontSize.md,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        height: '48px',
        fontSize: vars.typography.fontSize.lg,
      },
    },
    isFullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
  },
  defaultVariants: {
    isInvalid: false,
    size: 'medium',
    isFullWidth: false,
  },
});

globalStyle(`${select.classNames.base} option`, {
  background: vars.colors.background.input,
  color: vars.colors.text.primary,
  padding: vars.spacing.sm,
});

// `colors.text.disabled` doesn't exist on the theme -- text.secondary is the
// same "muted" token Input/Select already use for placeholder/helper text.
globalStyle(`${select.classNames.base} option:disabled`, {
  color: vars.colors.text.secondary,
});

export const selectGroup = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: vars.spacing.md,
    position: 'relative',
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: {
        width: '100%',
        marginBottom: vars.spacing.sm,
      },
    },
  },
  variants: {
    isFullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
  },
  defaultVariants: {
    isFullWidth: false,
  },
});

export const selectLabel = recipe({
  base: {
    display: 'block',
    marginBottom: vars.spacing.xs,
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: {
        marginBottom: `calc(${vars.spacing.xs} * 0.8)`,
      },
    },
  },
  variants: {
    isInvalid: {
      true: { color: vars.colors.text.error },
      false: { color: vars.colors.text.primary },
    },
    isRequired: {
      true: {
        selectors: {
          '&::after': {
            content: '" *"',
            color: vars.colors.text.error,
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isInvalid: false,
    isRequired: false,
  },
});

export const selectError = style({
  display: 'block',
  color: vars.colors.text.error,
  fontSize: vars.typography.fontSize.sm,
  marginTop: vars.spacing.xs,
});
