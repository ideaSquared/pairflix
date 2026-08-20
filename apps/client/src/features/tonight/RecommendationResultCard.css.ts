import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const resultCard = style({
  marginTop: vars.spacing.xl,
});

export const poster = style({
  width: '200px',
  aspectRatio: '2/3',
  objectFit: 'cover',
  borderRadius: vars.borderRadius.sm,
  flexShrink: 0,
});

export const rationale = style({
  fontStyle: 'italic',
  color: vars.colors.text.secondary,
});

export const providerLaunchButton = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: '999px',
  border: `1px solid ${vars.colors.primary}`,
  background: vars.colors.primary,
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: vars.typography.fontSize.sm,
  fontWeight: vars.typography.fontWeight.medium,
  transition: 'opacity 0.15s ease',
  selectors: {
    '&:hover': { opacity: 0.85 },
  },
});

export const badgeRow = style({
  flexWrap: 'wrap',
});
