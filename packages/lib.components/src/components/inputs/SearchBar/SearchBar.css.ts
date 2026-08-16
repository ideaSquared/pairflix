import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

export const searchContainer = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
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

export const searchInput = recipe({
  base: {
    background: vars.colors.background.input,
    color: vars.colors.text.primary,
    transition: 'all 0.2s ease-in-out',
    // `background.disabled`/`text.disabled` don't exist on the theme --
    // reuses the same background.secondary token Input/Select fall back to
    // for their own disabled states.
    selectors: {
      '&:disabled': {
        background: vars.colors.background.secondary,
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    },
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: {
        width: '100%',
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
  variants: {
    isInvalid: {
      true: {
        border: `1px solid ${vars.colors.text.error}`,
        selectors: {
          '&:hover': { borderColor: vars.colors.text.error },
          '&:focus': {
            outline: 'none',
            borderColor: vars.colors.text.error,
            boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.text.error} 25%, transparent)`,
          },
        },
      },
      false: {
        border: `1px solid ${vars.colors.border}`,
        selectors: {
          '&:hover': { borderColor: vars.colors.primary },
          '&:focus': {
            outline: 'none',
            borderColor: vars.colors.primary,
            boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.primary} 25%, transparent)`,
          },
        },
      },
    },
    hasButton: {
      true: {
        borderRadius: `${vars.borderRadius.sm} 0 0 ${vars.borderRadius.sm}`,
      },
      false: { borderRadius: vars.borderRadius.sm },
    },
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.sm,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.md,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.lg,
      },
    },
    isFullWidth: {
      true: { width: '100%' },
      false: { width: '300px' },
    },
  },
  defaultVariants: {
    isInvalid: false,
    hasButton: false,
    size: 'medium',
    isFullWidth: false,
  },
});

export const searchButton = recipe({
  base: {
    background: vars.colors.primary,
    color: 'white',
    border: `1px solid ${vars.colors.primary}`,
    borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    selectors: {
      '&:hover': {
        background: vars.colors.primaryHover,
        borderColor: vars.colors.primaryHover,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '2px',
      },
      '&:disabled': {
        background: vars.colors.background.secondary,
        borderColor: vars.colors.border,
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    },
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.sm,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.md,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.lg,
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

export const clearButton = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: vars.colors.text.secondary,
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease-in-out',
    selectors: {
      '&:hover': { color: vars.colors.text.primary },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '2px',
        borderRadius: vars.borderRadius.sm,
      },
    },
  },
  variants: {
    size: {
      small: { right: '8px' },
      medium: { right: '12px' },
      large: { right: '12px' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});
