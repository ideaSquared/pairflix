import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const container = style({
  marginBottom: vars.spacing.xl,
});

export const overrideCard = style({
  marginBottom: vars.spacing.md,
});

// `theme.borderRadius` (with no sub-key) was a phantom path -- `borderRadius`
// is `{ sm, md, lg }`, not a single value -- mapped to the closest real token.
export const codeEditor = style({
  width: '100%',
  minHeight: '300px',
  fontFamily: 'monospace',
  padding: vars.spacing.md,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.background.secondary,
  color: vars.colors.text.primary,
  resize: 'vertical',
});

export const buttonGroup = style({
  marginTop: vars.spacing.md,
});

// `33` hex alpha suffix (~20%) becomes color-mix against the var() reference.
export const environmentLabel = recipe({
  base: {
    display: 'inline-block',
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    borderRadius: vars.borderRadius.sm,
    fontSize: '0.8rem',
    fontWeight: vars.typography.fontWeight.medium,
    marginLeft: vars.spacing.sm,
  },
  variants: {
    env: {
      development: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.success} 20%, transparent)`,
        color: vars.colors.text.success,
      },
      staging: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.warning} 20%, transparent)`,
        color: vars.colors.text.warning,
      },
      production: {
        backgroundColor: `color-mix(in srgb, ${vars.colors.text.error} 20%, transparent)`,
        color: vars.colors.text.error,
      },
    },
  },
  defaultVariants: {
    env: 'development',
  },
});
