import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const characterCount = recipe({
  base: {
    fontSize: vars.typography.fontSize.sm,
    textAlign: 'right',
    marginTop: '4px',
  },
  variants: {
    error: {
      true: { color: vars.colors.text.error },
      false: { color: vars.colors.text.secondary },
    },
  },
  defaultVariants: {
    error: false,
  },
});

// The error/invalid border comes from the `aria-invalid` DOM attribute
// (below), not a variant -- matches the original, which never actually wired
// its `$error` transient prop into the rendered styles.
export const textarea = recipe({
  base: {
    width: '100%',
    padding: vars.spacing.sm,
    border: `1px solid ${vars.colors.border}`,
    borderRadius: vars.borderRadius.sm,
    fontFamily: 'inherit',
    fontSize: vars.typography.fontSize.md,
    lineHeight: 1.5,
    transition: 'border-color 0.2s',
    selectors: {
      '&:focus': {
        borderColor: vars.colors.primary,
        outline: 'none',
      },
      '&[aria-invalid="true"]': {
        borderColor: vars.colors.text.error,
      },
    },
  },
  variants: {
    size: {
      small: {
        padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.sm,
        minHeight: '60px',
      },
      medium: {},
      large: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.lg,
        minHeight: '120px',
      },
    },
    autoGrow: {
      true: { overflow: 'hidden', resize: 'none' },
      false: {},
    },
  },
  defaultVariants: {
    size: 'medium',
    autoGrow: false,
  },
});
