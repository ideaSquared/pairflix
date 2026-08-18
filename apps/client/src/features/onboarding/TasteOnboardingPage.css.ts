import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const header = style({
  marginBottom: vars.spacing.md,
});

export const chip = recipe({
  base: {
    padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: vars.typography.fontSize.sm,
    transition: 'background 0.15s ease',
  },
  variants: {
    selected: {
      true: {
        border: `1px solid ${vars.colors.primary}`,
        background: vars.colors.primary,
        color: '#ffffff',
        selectors: {
          '&:hover': { background: vars.colors.primary },
        },
      },
      false: {
        border: `1px solid ${vars.colors.border}`,
        background: 'transparent',
        color: vars.colors.text.primary,
        selectors: {
          '&:hover': { background: vars.colors.background.secondary },
        },
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const formSection = style({
  marginBottom: vars.spacing.lg,
});

export const poster = style({
  width: '160px',
  aspectRatio: '2/3',
  objectFit: 'cover',
  borderRadius: vars.borderRadius.sm,
  marginBottom: vars.spacing.md,
});

export const nextButton = style({
  marginTop: vars.spacing.lg,
});

export const errorMessage = style({
  marginTop: vars.spacing.md,
});
