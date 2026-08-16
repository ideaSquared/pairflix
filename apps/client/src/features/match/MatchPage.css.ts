import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { themeBreakpoints, vars } from '@pairflix/components';

export const posterContainer = style({
  flexShrink: 0,
  width: '150px', // Reduced from 200px for better space utilization
  '@media': {
    [`(max-width: ${themeBreakpoints.sm})`]: { width: '100%' },
  },
});

export const posterImage = style({
  width: '100%',
  aspectRatio: '2/3',
  objectFit: 'cover',
  borderRadius: vars.borderRadius.sm,
});

export const contentInfo = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

export const overview = style({
  color: vars.colors.text.secondary,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const statusContainer = style({
  marginTop: 'auto',
});

export const statusGroup = style({
  flex: 1,
  minWidth: '150px',
});

// WatchlistEntryStatus also allows 'flagged' | 'removed' | 'active', which
// the original switch had no explicit case for (fell through to the
// to_watch color, same as here).
export const statusBadge = recipe({
  base: {
    display: 'inline-block',
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    borderRadius: vars.borderRadius.sm,
    color: vars.colors.text.primary,
  },
  variants: {
    status: {
      to_watch: { background: vars.colors.status.toWatch },
      watch_together_focused: {
        background: vars.colors.status.watchTogetherFocused,
      },
      watch_together_background: {
        background: vars.colors.status.watchTogetherBackground,
      },
      watching: { background: vars.colors.status.watching },
      finished: { background: vars.colors.status.finished },
      flagged: { background: vars.colors.status.toWatch },
      removed: { background: vars.colors.status.toWatch },
      active: { background: vars.colors.status.toWatch },
    },
  },
  defaultVariants: {
    status: 'to_watch',
  },
});

// `percent` is an arbitrary number, not a closed prop union -- bucketed into
// the 3 outcomes the original threshold checks actually produced.
export const matchPercentage = recipe({
  base: {
    fontSize: vars.typography.fontSize.lg,
    fontWeight: vars.typography.fontWeight.bold,
  },
  variants: {
    bucket: {
      high: { color: vars.colors.text.success },
      medium: { color: vars.colors.text.warning },
      low: { color: vars.colors.status.watchTogetherBackground },
    },
  },
  defaultVariants: {
    bucket: 'low',
  },
});

export const matchLabel = style({
  marginTop: vars.spacing.xs,
});

export const noMatches = style({
  textAlign: 'center',
  padding: vars.spacing.xl,
  color: vars.colors.text.secondary,
});

// Overrides Grid's own `grid-template-columns` -- relies on this module
// being evaluated after `@pairflix/components` (see the import order in
// MatchPage.tsx) so these rules land later in the stylesheet and win.
export const matchesGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 2fr', // Left column 1/3, right column 2/3
  '@media': {
    [`(max-width: ${themeBreakpoints.xl})`]: {
      gridTemplateColumns: '1fr 1.5fr', // Less difference on smaller screens
    },
    [`(max-width: ${themeBreakpoints.md})`]: {
      gridTemplateColumns: '1fr', // Stack vertically on mobile
      gap: vars.spacing.md,
    },
  },
});

export const matchCard = style({
  marginBottom: vars.spacing.md,
  width: '100%',
});

export const contentMatchCard = style({
  marginBottom: vars.spacing.md,
  width: '100%',
});

globalStyle(`${contentMatchCard} .card-content`, {
  padding: vars.spacing.md,
});

export const filtersContainer = style({
  marginBottom: vars.spacing.md,
  '@media': {
    [`(max-width: ${themeBreakpoints.md})`]: { gap: vars.spacing.xs },
  },
});

globalStyle(`${filtersContainer} .select-group`, {
  '@media': {
    [`(max-width: ${themeBreakpoints.md})`]: {
      flex: 1,
      minWidth: '120px',
    },
  },
});
