import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const statsCard = style({
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  selectors: {
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: vars.shadows.lg,
    },
  },
});

export const statValue = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  margin: '0.5rem 0',
});

export const statLabel = style({
  color: vars.colors.text.secondary,
});

// `justifyContent`/`alignItems` are arbitrary caller-supplied CSS keywords
// (not a closed set of design-token variants), so they're applied as an
// inline style alongside this static `display: flex` base -- same as the
// original's per-instance dynamic values.
export const flex = style({
  display: 'flex',
});

export const statIcon = style({
  fontSize: '1.5rem',
  marginRight: '1rem',
  color: vars.colors.primary,
});
