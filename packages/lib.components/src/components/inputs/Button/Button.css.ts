import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

// ColorScheme is a closed union (see ../../../types) but the theme has no
// dedicated success/warning/error/info swatches on `colors` (only under
// `colors.text`), and no swatch at all for 'info' -- falls back to primary,
// matching the original runtime lookup's behavior
// (`theme.colors[colorScheme] || theme.colors.primary`).
const COLOR_SCHEME = {
  primary: vars.colors.primary,
  secondary: vars.colors.secondary,
  success: vars.colors.text.success,
  warning: vars.colors.text.warning,
  error: vars.colors.text.error,
  info: vars.colors.primary,
} as const;

type ColorSchemeKey = keyof typeof COLOR_SCHEME;

// Object.keys() widens to string[]; safe here since COLOR_SCHEME's keys are
// exactly ColorSchemeKey by construction (the `as const` above).
const COLOR_SCHEME_KEYS = Object.keys(COLOR_SCHEME) as ColorSchemeKey[];

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: vars.borderRadius.sm,
    fontFamily: vars.typography.fontFamily,
    fontWeight: vars.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    gap: vars.spacing.xs,
    position: 'relative',
    selectors: {
      '&:disabled': {
        background: vars.colors.secondary,
        cursor: 'not-allowed',
        opacity: 0.6,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '2px',
      },
    },
  },
  variants: {
    variant: {
      primary: {
        color: '#ffffff',
        selectors: {
          '&:hover:not(:disabled)': { background: vars.colors.primaryHover },
        },
      },
      secondary: {
        background: vars.colors.background.secondary,
        color: vars.colors.text.primary,
        border: `1px solid ${vars.colors.border}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.background.hover,
          },
        },
      },
      success: {
        background: vars.colors.text.success,
        color: '#ffffff',
        selectors: { '&:hover:not(:disabled)': { opacity: 0.9 } },
      },
      danger: {
        background: vars.colors.text.error,
        color: '#ffffff',
        selectors: { '&:hover:not(:disabled)': { opacity: 0.9 } },
      },
      warning: {
        background: vars.colors.text.warning,
        color: '#000000',
        selectors: { '&:hover:not(:disabled)': { opacity: 0.9 } },
      },
      text: {
        background: 'transparent',
        padding: vars.spacing.xs,
        selectors: {
          '&:hover:not(:disabled)': {
            textDecoration: 'underline',
            background: 'transparent',
          },
        },
      },
      outline: {
        background: 'transparent',
      },
    },
    // Values only take effect for the primary/text/outline variants, applied
    // via the compoundVariants below -- mirrors the original, where every
    // other variant hardcoded its own color and ignored colorScheme entirely.
    colorScheme: {
      primary: {},
      secondary: {},
      success: {},
      warning: {},
      error: {},
      info: {},
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
      false: {},
    },
    isLoading: {
      // !important preserved from the original: this has to win over the
      // colorScheme compound variants below, which set `color` too.
      true: { color: 'transparent !important', pointerEvents: 'none' },
      false: {},
    },
  },
  compoundVariants: [
    ...COLOR_SCHEME_KEYS.map(scheme => ({
      variants: { variant: 'primary' as const, colorScheme: scheme },
      style: { background: COLOR_SCHEME[scheme] },
    })),
    ...COLOR_SCHEME_KEYS.map(scheme => ({
      variants: { variant: 'text' as const, colorScheme: scheme },
      style: { color: COLOR_SCHEME[scheme] },
    })),
    ...COLOR_SCHEME_KEYS.map(scheme => ({
      variants: { variant: 'outline' as const, colorScheme: scheme },
      style: {
        color: COLOR_SCHEME[scheme],
        border: `1px solid ${COLOR_SCHEME[scheme]}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: `color-mix(in srgb, ${COLOR_SCHEME[scheme]} 12%, transparent)`,
          },
        },
      },
    })),
  ],
  defaultVariants: {
    variant: 'primary',
    colorScheme: 'primary',
    size: 'medium',
    isFullWidth: false,
    isLoading: false,
  },
});

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const loadingSpinner = style({
  position: 'absolute',
  display: 'inline-block',
  width: '1.2em',
  height: '1.2em',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '50%',
  borderTopColor: 'white',
  animation: `${spin} 0.8s linear infinite`,
});
