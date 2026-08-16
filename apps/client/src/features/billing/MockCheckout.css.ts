import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const mockBadge = style({
  display: 'inline-block',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  background: vars.colors.text.warning,
  color: vars.colors.background.primary,
  borderRadius: vars.borderRadius.sm,
  fontWeight: vars.typography.fontWeight.bold,
  letterSpacing: '0.05em',
  marginBottom: vars.spacing.md,
});

export const checkoutCard = style({
  maxWidth: '480px',
  margin: `${vars.spacing.xl} auto`,
});
