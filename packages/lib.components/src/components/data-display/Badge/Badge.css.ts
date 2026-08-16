import { keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

const slideIn = keyframes({
  from: { transform: 'scale(0.5)', opacity: 0 },
  to: { transform: 'scale(1)', opacity: 1 },
});

// Colors used both for the solid variant fills and (transparent bg + this
// color as text/border) for the outlined look -- kept as a map so the
// `outlined` compound variants below can reuse the same token per variant.
const VARIANT_COLOR = {
  primary: vars.colors.primary,
  secondary: vars.colors.secondary,
  success: vars.colors.text.success,
  error: vars.colors.text.error,
  warning: vars.colors.text.warning,
  info: vars.colors.primary,
  default: vars.colors.text.secondary,
} as const;

type SolidVariant = keyof typeof VARIANT_COLOR;

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: vars.typography.fontWeight.medium,
    lineHeight: 1.2,
    transition: 'all 0.2s ease',
    selectors: {
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '2px',
      },
    },
  },
  variants: {
    variant: {
      primary: { backgroundColor: VARIANT_COLOR.primary, color: '#ffffff' },
      secondary: { backgroundColor: VARIANT_COLOR.secondary, color: '#ffffff' },
      success: { backgroundColor: VARIANT_COLOR.success, color: '#ffffff' },
      error: { backgroundColor: VARIANT_COLOR.error, color: '#ffffff' },
      warning: { backgroundColor: VARIANT_COLOR.warning, color: '#ffffff' },
      info: { backgroundColor: VARIANT_COLOR.info, color: '#ffffff' },
      default: {
        backgroundColor: `${VARIANT_COLOR.default}20`,
        color: VARIANT_COLOR.default,
      },
    },
    size: {
      small: {
        padding: vars.spacing.xs,
        fontSize: vars.typography.fontSize.xs,
        minWidth: '16px',
      },
      medium: {
        padding: vars.spacing.sm,
        fontSize: vars.typography.fontSize.sm,
        minWidth: '20px',
      },
      large: {
        padding: vars.spacing.md,
        fontSize: vars.typography.fontSize.md,
        minWidth: '28px',
      },
    },
    pill: {
      true: { borderRadius: '999px' },
      false: { borderRadius: vars.borderRadius.sm },
    },
    outlined: {
      true: {},
      false: {},
    },
    dot: {
      true: {
        width: '8px',
        height: '8px',
        padding: 0,
        borderRadius: '50%',
        minWidth: 'unset',
      },
      false: {},
    },
    absolute: {
      true: { position: 'absolute' },
      false: {},
    },
    // Values only take effect combined with `absolute: true` via the
    // compoundVariants below -- mirrors the original, where position styles
    // were only mixed in when `absolute` was truthy.
    position: {
      'top-right': {},
      'top-left': {},
      'bottom-right': {},
      'bottom-left': {},
    },
    animate: {
      true: { animation: `${slideIn} 0.2s ease-out` },
      false: {},
    },
  },
  compoundVariants: [
    ...(Object.keys(VARIANT_COLOR) as SolidVariant[]).map(variant => ({
      variants: { variant, outlined: true as const },
      style: {
        backgroundColor: 'transparent',
        color: VARIANT_COLOR[variant],
        border: `1px solid ${VARIANT_COLOR[variant]}`,
      },
    })),
    {
      variants: { absolute: true as const, position: 'top-right' as const },
      style: { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    },
    {
      variants: { absolute: true as const, position: 'top-left' as const },
      style: { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    },
    {
      variants: { absolute: true as const, position: 'bottom-right' as const },
      style: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
    },
    {
      variants: { absolute: true as const, position: 'bottom-left' as const },
      style: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'medium',
    pill: false,
    outlined: false,
    dot: false,
    absolute: false,
    position: 'top-right',
    animate: false,
  },
});
