import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const pageHeader = style({
  marginBottom: vars.spacing.lg,
});

export const historyList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const historyRow = style({
  display: 'grid',
  gridTemplateColumns: '80px 1fr auto',
  gap: vars.spacing.md,
  alignItems: 'center',
  '@media': {
    '(max-width: 600px)': {
      gridTemplateColumns: '64px 1fr',
      gridTemplateAreas: "'poster meta' 'actions actions'",
    },
  },
});

export const poster = style({
  width: '80px',
  height: '120px',
  objectFit: 'cover',
  borderRadius: vars.borderRadius.sm,
  background: vars.colors.background.secondary,
  gridArea: 'poster',
  '@media': {
    '(max-width: 600px)': {
      width: '64px',
      height: '96px',
    },
  },
});

export const meta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  gridArea: 'meta',
});

export const actions = style({
  display: 'flex',
  gap: vars.spacing.sm,
  gridArea: 'actions',
});

export const emptyState = style({
  padding: vars.spacing.xl,
  textAlign: 'center',
  color: vars.colors.text.secondary,
});
