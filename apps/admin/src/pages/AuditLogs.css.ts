import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const logGrid = style({
  marginTop: '20px',
});

export const logEntry = style({
  backgroundColor: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.sm,
  padding: vars.spacing.md,
  marginBottom: vars.spacing.sm,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
});

export const logLevel = recipe({
  base: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    marginRight: vars.spacing.sm,
  },
  variants: {
    level: {
      info: { backgroundColor: '#d1ecf1', color: '#0c5460' },
      warn: { backgroundColor: '#fff3cd', color: '#856404' },
      error: { backgroundColor: '#f8d7da', color: '#721c24' },
      debug: { backgroundColor: '#e2e3e5', color: '#383d41' },
    },
  },
  defaultVariants: {
    level: 'debug',
  },
});

export const timestamp = style({
  color: vars.colors.text.secondary,
  fontSize: '0.875rem',
});

// `& svg` targets a descendant, so it goes through globalStyle rather than
// `selectors`.
export const errorDisplay = style({
  padding: vars.spacing.md,
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: vars.borderRadius.md,
  marginBottom: vars.spacing.lg,
  borderLeft: '4px solid #dc3545',
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
});

globalStyle(`${errorDisplay} svg`, {
  marginTop: '2px',
  flexShrink: 0,
});

export const retryButton = style({
  backgroundColor: '#721c24',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: vars.borderRadius.sm,
  fontWeight: 500,
  cursor: 'pointer',
  marginTop: vars.spacing.sm,
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
});
