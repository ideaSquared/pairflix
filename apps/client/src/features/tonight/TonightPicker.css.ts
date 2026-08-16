import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

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

export const sliderRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  margin: `${vars.spacing.md} 0`,
});

export const slider = style({
  flex: 1,
});

// Overrides Button's own font-size/padding -- relies on this module being
// evaluated after `@pairflix/components` (see the import order in
// TonightPicker.tsx) so these rules land later in the stylesheet and win.
export const pickButton = style({
  marginTop: vars.spacing.lg,
  fontSize: vars.typography.fontSize.lg,
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
});

export const resultCard = style({
  marginTop: vars.spacing.xl,
});

export const poster = style({
  width: '200px',
  aspectRatio: '2/3',
  objectFit: 'cover',
  borderRadius: vars.borderRadius.sm,
  flexShrink: 0,
});

export const rationale = style({
  fontStyle: 'italic',
  color: vars.colors.text.secondary,
});

export const providerLaunchButton = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: '999px',
  border: `1px solid ${vars.colors.primary}`,
  background: vars.colors.primary,
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: vars.typography.fontSize.sm,
  fontWeight: vars.typography.fontWeight.medium,
  transition: 'opacity 0.15s ease',
  selectors: {
    '&:hover': { opacity: 0.85 },
  },
});

export const actionRow = style({
  marginTop: vars.spacing.lg,
});

export const formSection = style({
  marginBottom: vars.spacing.lg,
});

export const label = style({
  marginBottom: vars.spacing.sm,
  fontWeight: vars.typography.fontWeight.bold,
});

export const errorMessage = style({
  marginTop: vars.spacing.md,
});

export const badgeRow = style({
  flexWrap: 'wrap',
});
