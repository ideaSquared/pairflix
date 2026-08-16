import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const feedContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  '@media': {
    '(max-width: 768px)': { padding: '0 1rem' },
  },
});

export const activityItem = style({
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.card,
  borderRadius: vars.borderRadius.md,
  padding: '1rem',
  boxShadow: vars.shadows.sm,
  transition: 'transform 0.2s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: vars.shadows.md,
    },
  },
  '@media': {
    '(max-width: 768px)': { padding: '0.75rem' },
  },
});

export const activityHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
});

export const activityTitle = style({
  fontSize: vars.typography.fontSize.md,
  margin: 0,
  color: vars.colors.text.primary,
});

export const activityTime = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
});

export const activityContent = style({
  fontSize: vars.typography.fontSize.md,
  color: vars.colors.text.primary,
});

export const activityDetails = style({
  marginTop: '0.5rem',
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  textAlign: 'center',
  color: vars.colors.text.secondary,
});

export const activityIcon = style({
  marginRight: '0.5rem',
});
