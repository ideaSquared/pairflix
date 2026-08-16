import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const recommendationsContainer = style({
  marginTop: '2rem',
});

export const recommendationsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1.5rem',
  marginTop: '1rem',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '1rem',
    },
  },
});

export const recommendationCard = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.2s ease',
  selectors: {
    '&:hover': { transform: 'translateY(-4px)' },
  },
});

export const cardHeader = style({
  position: 'relative',
  aspectRatio: '2/3',
  overflow: 'hidden',
  borderTopLeftRadius: vars.borderRadius.md,
  borderTopRightRadius: vars.borderRadius.md,
});

export const posterImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const posterFallback = style({
  background: '#2a2a2a',
  width: '100%',
  height: '100%',
});

export const scoreBadge = style({
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  background: vars.colors.primary,
  color: 'white',
  borderRadius: '50%',
  padding: '0.5rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '3rem',
  height: '3rem',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
});

export const cardBody = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const contentTitle = style({
  fontWeight: 'bold',
  margin: '0.5rem 0',
  fontSize: vars.typography.fontSize.lg,
});

export const reasonText = style({
  marginTop: 'auto',
  color: vars.colors.text.secondary,
  fontStyle: 'italic',
  fontSize: vars.typography.fontSize.sm,
});

export const emptyState = style({
  textAlign: 'center',
  padding: '3rem 1rem',
  color: vars.colors.text.secondary,
});
