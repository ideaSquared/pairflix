import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

export const inputGroup = recipe({
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

export const input = recipe({
  base: {
    background: vars.colors.background.input,
    color: vars.colors.text.primary,
    borderRadius: vars.borderRadius.sm,
    transition: 'all 0.2s ease-in-out',
    selectors: {
      '&::placeholder': {
        color: vars.colors.text.secondary,
        opacity: 0.8,
      },
      '&:disabled': {
        background: vars.colors.background.secondary,
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
    hasStartAdornment: {
      true: { paddingLeft: '36px' },
      false: {},
    },
    hasEndAdornment: {
      true: { paddingRight: '36px' },
      false: {},
    },
  },
  defaultVariants: {
    isInvalid: false,
    size: 'medium',
    isFullWidth: false,
    hasStartAdornment: false,
    hasEndAdornment: false,
  },
});

export const inputLabel = recipe({
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

export const inputError = style({
  display: 'block',
  color: vars.colors.text.error,
  fontSize: vars.typography.fontSize.sm,
  marginTop: vars.spacing.xs,
});

export const adornmentWrapper = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: vars.colors.text.secondary,
    pointerEvents: 'none',
  },
  variants: {
    position: {
      start: { left: '12px' },
      end: { right: '12px' },
    },
  },
});

// A selector can only target its own generated class (see vanilla-extract's
// `selectors` docs) -- reaching into arbitrary consumer-supplied adornment
// content (e.g. PasswordInput's toggle button) needs globalStyle instead.
globalStyle(
  `${adornmentWrapper.classNames.base} button, ${adornmentWrapper.classNames.base} a, ${adornmentWrapper.classNames.base} [role="button"]`,
  { pointerEvents: 'auto' }
);
