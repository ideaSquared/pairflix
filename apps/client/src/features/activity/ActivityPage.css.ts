import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const pageContent = style({
  padding: '2rem 1rem',
  '@media': {
    '(max-width: 768px)': { padding: '1rem 0.5rem' },
  },
});

export const pageHeader = style({
  marginBottom: '2rem',
  textAlign: 'center',
});

export const title = style({
  fontSize: vars.typography.fontSize.xl,
  color: vars.colors.text.primary,
  marginBottom: '0.5rem',
  '@media': {
    '(max-width: 768px)': { fontSize: vars.typography.fontSize.lg },
  },
});

export const description = style({
  fontSize: vars.typography.fontSize.md,
  color: vars.colors.text.secondary,
  maxWidth: '600px',
  margin: '0 auto',
  '@media': {
    '(max-width: 768px)': { fontSize: vars.typography.fontSize.sm },
  },
});
