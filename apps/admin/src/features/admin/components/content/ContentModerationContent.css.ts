import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const contentTypeBadge = style({
  textTransform: 'capitalize',
});

export const subHeading = style({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
});

export const styledCard = style({
  marginBottom: '10px',
  padding: '15px',
});
