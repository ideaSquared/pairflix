import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const devContainer = style({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: 9999,
  maxWidth: '300px',
});

export const devCardWrapper = style({
  background: vars.colors.background.secondary,
  border: `2px solid ${vars.colors.primary}`,
  boxShadow: vars.shadows.lg,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
});

export const devHeader = style({
  background: vars.colors.primary,
  color: vars.colors.text.primary,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  margin: `-${vars.spacing.md} -${vars.spacing.md} ${vars.spacing.sm} -${vars.spacing.md}`,
  fontWeight: vars.typography.fontWeight.bold,
  fontSize: vars.typography.fontSize.xs,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderRadius: `${vars.borderRadius.sm} ${vars.borderRadius.sm} 0 0`,
});

export const userGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.spacing.xs,
  marginBottom: vars.spacing.sm,
});

export const quickLoginButton = style({
  fontSize: vars.typography.fontSize.xs,
  padding: vars.spacing.xs,
  minHeight: 'auto',
});

export const statusBadge = recipe({
  base: {
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: vars.borderRadius.sm,
    marginLeft: '4px',
    color: vars.colors.text.primary,
  },
  variants: {
    status: {
      active: { background: vars.colors.text.success },
      banned: { background: vars.colors.text.error },
      suspended: { background: vars.colors.text.warning },
      admin: { background: vars.colors.primary },
      free: { background: vars.colors.background.hover },
      premium: { background: vars.colors.primary },
    },
  },
  defaultVariants: {
    status: 'active',
  },
});

export const toggleButton = style({
  fontSize: vars.typography.fontSize.xs,
  padding: vars.spacing.xs,
  minHeight: 'auto',
  marginBottom: vars.spacing.xs,
});

export const loadingText = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  textAlign: 'center',
  padding: vars.spacing.xs,
});

export const errorMessage = style({
  color: vars.colors.text.error,
  fontSize: vars.typography.fontSize.xs,
  marginBottom: vars.spacing.xs,
  padding: vars.spacing.xs,
  // Original was a hex+alpha-suffix concat (`${theme.colors.text.error}20`,
  // i.e. 0x20/0xff alpha) which doesn't work against a var() reference.
  background: `color-mix(in srgb, ${vars.colors.text.error} 12.5%, transparent)`,
  borderRadius: vars.borderRadius.sm,
});

export const devTip = style({
  fontSize: '10px',
  color: vars.colors.text.secondary,
  textAlign: 'center',
  marginTop: vars.spacing.xs,
  padding: vars.spacing.xs,
  background: vars.colors.background.hover,
  borderRadius: vars.borderRadius.sm,
});

export const quickLoginHeader = style({
  fontSize: '14px',
  fontWeight: vars.typography.fontWeight.bold,
  marginBottom: vars.spacing.xs,
  color: vars.colors.text.primary,
});

export const devContent = style({
  padding: vars.spacing.md,
});
