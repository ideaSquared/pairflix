import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

// WatchlistEntryStatus also allows 'flagged' | 'removed' | 'active', which
// the original switch had no explicit case for (fell through to the
// to_watch color, same as here).
export const watchlistCard = recipe({
  base: {},
  variants: {
    status: {
      to_watch: { borderLeft: `4px solid ${vars.colors.status.toWatch}` },
      watch_together_focused: {
        borderLeft: `4px solid ${vars.colors.status.watchTogetherFocused}`,
      },
      watch_together_background: {
        borderLeft: `4px solid ${vars.colors.status.watchTogetherBackground}`,
      },
      watching: { borderLeft: `4px solid ${vars.colors.status.watching}` },
      finished: { borderLeft: `4px solid ${vars.colors.status.finished}` },
      flagged: { borderLeft: `4px solid ${vars.colors.status.toWatch}` },
      removed: { borderLeft: `4px solid ${vars.colors.status.toWatch}` },
      active: { borderLeft: `4px solid ${vars.colors.status.toWatch}` },
    },
  },
  defaultVariants: {
    status: 'to_watch',
  },
});

// Overrides Button's own background -- relies on this module being
// evaluated after `@pairflix/components` (see the import order in
// WatchlistPage.tsx) so these rules land later in the stylesheet and win.
export const tabButton = recipe({
  base: {},
  variants: {
    active: {
      true: {
        background: vars.colors.primary,
        selectors: {
          '&:hover': { background: vars.colors.primary },
        },
      },
      false: {
        background: vars.colors.background.secondary,
        selectors: {
          '&:hover': { background: vars.colors.border },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const relativeCard = style({
  position: 'relative',
});

// Overrides CardGrid's own `grid-template-columns` / `gap` -- relies on this
// module being evaluated after `@pairflix/components` so these rules land
// later in the stylesheet and win.
export const gridContainer = style({
  marginTop: vars.spacing.lg,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: vars.spacing.md,
  '@media': {
    '(min-width: 1200px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    },
    '(min-width: 1600px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    },
    '(min-width: 2000px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    },
  },
});

export const listContainer = style({
  marginTop: vars.spacing.lg,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const listViewItem = style({
  display: 'flex',
  marginBottom: vars.spacing.md,
  width: '100%',
});

globalStyle(`${listViewItem} ${relativeCard}`, {
  flex: 1,
  display: 'flex',
  gap: vars.spacing.lg,
});

globalStyle(`${listViewItem} ${relativeCard} .content`, {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
});

globalStyle(`${listViewItem} ${relativeCard} .actions`, {
  display: 'flex',
  alignItems: 'flex-start',
  paddingLeft: vars.spacing.md,
});

export const tagsSection = style({
  marginTop: vars.spacing.md,
  paddingTop: vars.spacing.sm,
  borderTop: `1px solid ${vars.colors.border}`,
});

export const tagsContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem',
  marginTop: '0.5rem',
});

export const tag = style({
  background: vars.colors.primary,
  color: 'white',
  padding: '0.15rem 0.4rem',
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSize.sm,
});

export const doneEditingButton = style({
  marginTop: vars.spacing.sm,
});

export const tabsRow = style({
  marginBottom: vars.spacing.md,
});

export const virtualizedContainer = style({
  overflow: 'auto',
  position: 'relative',
});

export const virtualizedContent = style({
  position: 'relative',
});
