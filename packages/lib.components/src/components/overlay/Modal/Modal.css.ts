import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { layoutTokens } from '../../layout/utils/responsive';
import { vars } from '../../../styles/theme.css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: vars.colors.overlay,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: layoutTokens.modal.zIndex,
  padding: vars.spacing.md,
  overflowY: 'auto',
  pointerEvents: 'auto',
});

// `fullscreen` only covers max-height/margin -- max-width varies per size
// (including arbitrary custom strings like "450px"), so it's applied as an
// inline style in the component instead of a recipe variant.
export const content = recipe({
  base: {
    backgroundColor: vars.colors.background.paper,
    borderRadius: vars.borderRadius.md,
    border: '1px solid #e0e0e0',
    boxShadow: vars.shadows.lg,
    width: '100%',
    overflowY: 'auto',
    padding: vars.spacing.lg,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    fullscreen: {
      true: {
        maxHeight: '100%',
        margin: 0,
        '@media': {
          '(max-width: 576px)': {
            padding: vars.spacing.md,
            maxHeight: '95vh',
          },
        },
      },
      false: {
        maxHeight: '90vh',
        margin: '10px',
        '@media': {
          '(max-width: 576px)': {
            padding: vars.spacing.md,
            maxHeight: '95vh',
          },
        },
      },
    },
  },
  defaultVariants: { fullscreen: false },
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: vars.spacing.md,
  borderBottom: '1px solid #e0e0e0',
  paddingBottom: vars.spacing.sm,
});

export const title = style({
  margin: 0,
  fontSize: vars.typography.fontSize.lg,
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.primary,
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.5rem',
  color: vars.colors.text.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing.xs,
  borderRadius: vars.borderRadius.sm,
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      backgroundColor: vars.colors.background.hover,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: '2px',
    },
  },
  '@media': {
    '(max-width: 576px)': {
      padding: vars.spacing.sm,
    },
  },
});
