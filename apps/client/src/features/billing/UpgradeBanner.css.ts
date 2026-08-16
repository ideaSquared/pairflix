import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const bannerContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  background: vars.colors.background.secondary,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
  marginBottom: vars.spacing.md,
});
