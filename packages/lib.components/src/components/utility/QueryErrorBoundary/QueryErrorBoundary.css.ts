import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const errorContainer = style({
  maxWidth: '600px',
  margin: `${vars.spacing.xl} auto`,
});

export const errorMessage = style({
  margin: `${vars.spacing.md} 0`,
  padding: vars.spacing.md,
  background: vars.colors.background.primary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  overflowX: 'auto',
});
