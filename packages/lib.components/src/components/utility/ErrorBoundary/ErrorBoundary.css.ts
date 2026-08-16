import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

// Local flex helper for the action-button row -- only ever used at a fixed
// `gap: md` in this file, with `wrap` varying between the two call sites.
export const flexRow = recipe({
  base: {
    display: 'flex',
    gap: vars.spacing.md,
  },
  variants: {
    wrap: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
    },
  },
  defaultVariants: { wrap: false },
});

export const errorContainer = style({
  maxWidth: '600px',
  margin: `${vars.spacing.xl} auto`,
  '@media': {
    [`(max-width: ${breakpoints.sm})`]: { margin: `${vars.spacing.lg} auto` },
  },
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
