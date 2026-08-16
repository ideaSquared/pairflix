import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '20px',
});

export const statCard = style({
  backgroundColor: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.md,
  padding: vars.spacing.md,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const statTitle = style({
  margin: `0 0 ${vars.spacing.sm}`,
  color: vars.colors.text.secondary,
  fontSize: '0.875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const statValue = style({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: vars.colors.text.primary,
});

export const statSection = style({
  marginTop: vars.spacing.lg,
});

export const sectionTitle = style({
  margin: `0 0 ${vars.spacing.md}`,
  fontSize: '1.25rem',
});
