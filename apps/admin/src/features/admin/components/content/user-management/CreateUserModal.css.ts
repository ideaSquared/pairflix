import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const formGroup = style({
  marginBottom: vars.spacing.md,
});

// `40` hex alpha suffix (~25%) becomes color-mix against the var() reference.
export const styledSelect = style({
  background: vars.colors.background.input,
  color: vars.colors.text.primary,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  width: '100%',
  fontSize: vars.typography.fontSize.md,
  transition: 'all 0.2s ease-in-out',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.colors.primary,
      boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.colors.primary} 25%, transparent)`,
    },
  },
});

export const modalContent = style({
  maxWidth: '500px',
  width: '100%',
});

export const modalFooter = style({
  marginTop: '20px',
});

export const buttonIcon = style({
  marginRight: '8px',
});
