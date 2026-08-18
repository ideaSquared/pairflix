import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const settingsContainer = style({
  paddingBottom: vars.spacing.xl,
});

export const settingsSection = style({
  marginBottom: vars.spacing.lg,
});

export const formGroup = style({
  marginBottom: vars.spacing.md,
});

export const checkboxLabel = style({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginBottom: vars.spacing.sm,
});

export const checkbox = style({
  marginRight: vars.spacing.sm,
});

export const settingDescription = style({
  color: vars.colors.text.secondary,
  fontSize: '0.85rem',
  marginTop: vars.spacing.xs,
});

export const submitButtonContainer = style({
  marginTop: vars.spacing.lg,
  paddingTop: vars.spacing.md,
  borderTop: `1px solid ${vars.colors.border}`,
});
