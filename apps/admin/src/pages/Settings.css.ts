import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const settingsContainer = style({
  maxWidth: '800px',
});

export const section = style({
  backgroundColor: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.md,
  padding: vars.spacing.lg,
  marginBottom: vars.spacing.lg,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const sectionTitle = style({
  margin: `0 0 ${vars.spacing.md}`,
  fontSize: '1.25rem',
});

export const formGroup = style({
  marginBottom: vars.spacing.md,
});

export const label = style({
  display: 'block',
  marginBottom: vars.spacing.xs,
  fontWeight: 500,
});

const fieldBase = {
  width: '100%',
  padding: vars.spacing.sm,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.background.primary,
  color: vars.colors.text.primary,
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.colors.primary,
      boxShadow: `0 0 0 2px ${vars.colors.primary}`,
    },
  },
} as const;

export const input = style(fieldBase);

export const select = style(fieldBase);

export const checkbox = style({
  marginRight: vars.spacing.xs,
});

export const buttonContainer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.spacing.sm,
  marginTop: vars.spacing.lg,
});
