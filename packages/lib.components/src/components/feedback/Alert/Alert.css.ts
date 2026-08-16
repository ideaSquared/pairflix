import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

const slideIn = keyframes({
  from: { transform: 'translateY(-100%)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

// `vars.*` are CSS custom property references, not raw hex strings, so the
// original `color + '15'` hex-alpha-suffix trick can't work here -- color-mix
// gets the same "tinted background" effect against a var(). ~8% mirrors the
// opacity the original hex suffix produced (0x15 / 0xff).
const tint = (color: string) => `color-mix(in srgb, ${color} 8%, transparent)`;

export const alert = recipe({
  base: {
    position: 'relative',
    alignItems: 'flex-start',
    gap: vars.spacing.sm,
    borderLeft: '4px solid',
    borderRadius: vars.borderRadius.sm,
  },
  variants: {
    variant: {
      info: {
        background: tint(vars.colors.primary),
        borderColor: vars.colors.primary,
        color: vars.colors.primary,
      },
      success: {
        background: tint(vars.colors.text.success),
        borderColor: vars.colors.text.success,
        color: vars.colors.text.success,
      },
      warning: {
        background: tint(vars.colors.text.warning),
        borderColor: vars.colors.text.warning,
        color: vars.colors.text.warning,
      },
      error: {
        background: tint(vars.colors.text.error),
        borderColor: vars.colors.text.error,
        color: vars.colors.text.error,
      },
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
    visible: {
      true: { display: 'flex' },
      false: { display: 'none' },
    },
    animate: {
      true: { animation: `${slideIn} 0.3s ease-out` },
      false: { animation: 'none' },
    },
  },
  defaultVariants: {
    variant: 'info',
    size: 'medium',
    visible: true,
    animate: true,
  },
});

export const content = style({ flex: 1 });

export const message = style({ fontWeight: vars.typography.fontWeight.medium });

export const description = style({
  marginTop: vars.spacing.xs,
  color: vars.colors.text.secondary,
  fontSize: '0.9em',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  padding: vars.spacing.xs,
  cursor: 'pointer',
  color: 'inherit',
  opacity: 0.7,
  transition: 'opacity 0.2s ease',
  selectors: {
    '&:hover': { opacity: 1 },
    '&:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '2px',
      borderRadius: '2px',
    },
  },
});

export const actions = style({
  display: 'flex',
  gap: vars.spacing.sm,
  marginTop: vars.spacing.sm,
});

export const iconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: '1.2em',
});
