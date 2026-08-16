import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

const slideIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px) scale(0.95)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const slideOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(-4px) scale(0.95)' },
});

/**
 * Content container shared by the root dropdown content and sub-menu content.
 */
export const content = recipe({
  base: {
    borderRadius: vars.borderRadius.sm,
    padding: `${vars.spacing.xs} 0`,
    maxWidth: '320px',
    zIndex: 1000,
    border: 'none',
    selectors: {
      '&[data-state="open"]': { animation: `${slideIn} 0.2s ease-out` },
      '&[data-state="closed"]': { animation: `${slideOut} 0.15s ease-in` },
    },
  },
  variants: {
    variant: {
      dark: {
        background: '#2d2d2d',
        color: '#ffffff',
        boxShadow: vars.shadows.md,
      },
      light: {
        background: '#ffffff',
        color: vars.colors.text.primary,
        boxShadow: vars.shadows.md,
        border: '1px solid #e0e0e0',
      },
      elevated: {
        background: vars.colors.background.paper,
        color: vars.colors.text.primary,
        boxShadow: vars.shadows.lg,
      },
      default: {
        background: vars.colors.background.paper,
        color: vars.colors.text.primary,
        boxShadow: vars.shadows.md,
      },
    },
    size: {
      small: { minWidth: '150px' },
      medium: { minWidth: '180px' },
      large: { minWidth: '220px' },
    },
  },
  defaultVariants: { variant: 'default', size: 'medium' },
});

export const item = recipe({
  base: {
    cursor: 'pointer',
    outline: 'none',
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    width: '100%',
    textAlign: 'left',
    userSelect: 'none',
    position: 'relative',
    transition: 'all 0.15s ease-in-out',
    selectors: {
      '&[data-disabled]': {
        color: vars.colors.text.secondary,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: 0.5,
      },
      '&:focus-visible': {
        background: vars.colors.background.hover,
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '-2px',
      },
    },
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },
    variant: {
      default: {
        color: 'inherit',
        selectors: {
          '&[data-highlighted]': { background: vars.colors.background.hover },
        },
      },
      destructive: {
        color: vars.colors.text.error,
        selectors: {
          '&[data-highlighted]': { background: '#ffebee' },
        },
      },
      success: {
        color: vars.colors.text.success,
        selectors: {
          '&[data-highlighted]': { background: '#e8f5e8' },
        },
      },
    },
  },
  defaultVariants: { size: 'medium', variant: 'default' },
});

export const itemIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
});

export const itemShortcut = style({
  marginLeft: 'auto',
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  opacity: 0.8,
});

export const separator = style({
  height: '1px',
  background: '#eee',
  margin: `${vars.spacing.xs} 0`,
});

export const label = recipe({
  base: {
    fontWeight: vars.typography.fontWeight.medium,
    color: vars.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      medium: {
        padding: `${vars.spacing.xs} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.xs,
      },
      large: {
        padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.sm,
      },
    },
  },
  defaultVariants: { size: 'medium' },
});

export const subTrigger = recipe({
  base: {
    cursor: 'pointer',
    outline: 'none',
    background: 'none',
    border: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    width: '100%',
    textAlign: 'left',
    userSelect: 'none',
    position: 'relative',
    selectors: {
      '&::after': {
        content: '"▶"',
        marginLeft: 'auto',
        fontSize: '10px',
        opacity: 0.7,
      },
      '&[data-disabled]': {
        color: vars.colors.text.secondary,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: 0.5,
      },
      '&[data-highlighted]': {
        background: vars.colors.background.hover,
      },
    },
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
  defaultVariants: { size: 'medium' },
});

export const checkboxItem = recipe({
  base: {
    cursor: 'pointer',
    outline: 'none',
    background: 'none',
    border: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    width: '100%',
    textAlign: 'left',
    userSelect: 'none',
    position: 'relative',
    selectors: {
      '&[data-disabled]': {
        color: vars.colors.text.secondary,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: 0.5,
      },
      '&[data-highlighted]': {
        background: vars.colors.background.hover,
      },
    },
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      medium: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
  defaultVariants: { size: 'medium' },
});

export const itemIndicator = style({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: vars.spacing.xs,
  selectors: {
    '&::after': {
      content: '"✓"',
      fontSize: '12px',
      color: vars.colors.primary,
      fontWeight: 'bold',
    },
  },
});
