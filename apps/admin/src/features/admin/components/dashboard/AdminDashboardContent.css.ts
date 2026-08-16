import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const dashboardGrid = style({
  marginTop: vars.spacing.lg,
});

export const actionButtons = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
  marginTop: vars.spacing.lg,
});

export const sectionTitle = style({
  marginBottom: vars.spacing.md,
  marginTop: vars.spacing.lg,
});

export const retryButton = style({
  marginTop: vars.spacing.md,
});

export const recentUsersTrend = style({
  marginTop: vars.spacing.sm,
});

export const systemErrorText = style({
  color: 'var(--color-error)',
  marginTop: vars.spacing.sm,
});

export const testNavLink = style({
  display: 'inline-block',
  padding: '8px 16px',
  backgroundColor: '#4CAF50',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
});
