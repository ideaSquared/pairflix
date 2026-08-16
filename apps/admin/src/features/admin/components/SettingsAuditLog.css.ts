import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const auditLogContainer = style({
  padding: `${vars.spacing.md} 0`,
});

export const logEntry = recipe({
  base: {
    marginBottom: vars.spacing.md,
  },
  variants: {
    level: {
      info: { borderLeft: `4px solid ${vars.colors.text.success}` },
      warn: { borderLeft: `4px solid ${vars.colors.text.warning}` },
      error: { borderLeft: `4px solid ${vars.colors.text.error}` },
      debug: { borderLeft: `4px solid ${vars.colors.primary}` },
    },
  },
  defaultVariants: {
    level: 'debug',
  },
});

// `theme.colors.border.light` was a phantom path -- `border` is a single
// string, not `{ light, ... }` -- mapped to the closest real token.
export const logHeader = style({
  paddingBottom: vars.spacing.sm,
  borderBottom: `1px solid ${vars.colors.border}`,
  marginBottom: vars.spacing.sm,
});

export const logTimestamp = style({
  color: vars.colors.text.secondary,
  fontSize: '0.85rem',
});

// `theme.borderRadius` (with no sub-key) was a phantom path -- mapped to the
// closest real token. Targets a descendant `<pre>`, so it goes through
// globalStyle rather than `selectors`.
export const logBody = style({});

globalStyle(`${logBody} pre`, {
  backgroundColor: vars.colors.background.secondary,
  padding: vars.spacing.sm,
  borderRadius: vars.borderRadius.sm,
  overflow: 'auto',
  maxHeight: '300px',
  fontSize: '0.9rem',
});

export const noLogEntries = style({
  textAlign: 'center',
  padding: vars.spacing.lg,
  color: vars.colors.text.secondary,
});
