import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { themeBreakpoints, vars } from '@pairflix/components';

export const posterImage = recipe({
  base: {
    width: '100%',
    borderRadius: vars.borderRadius.sm,
  },
  variants: {
    isListView: {
      true: { maxWidth: '150px', height: '225px' },
      false: { maxWidth: '100%', height: '300px' },
    },
  },
  defaultVariants: {
    isListView: false,
  },
});

export const overview = style({
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  margin: `${vars.spacing.sm} 0`,
});

// Combines what were originally two nested styled-components (a base list
// item and an "enhanced" wrapper extending it via `styled(ListViewItem)`) --
// vanilla-extract has no equivalent of extending another styled component's
// generated class, and this is the only place either was used, so folding
// them into one class avoids relying on stylesheet-order overrides between
// the two conflicting `.content { flex }` declarations they had.
export const enhancedListViewItem = style({
  display: 'flex',
  width: '100%',
  marginBottom: vars.spacing.md,
});

globalStyle(`${enhancedListViewItem} > div`, {
  flex: 1,
  display: 'flex',
  gap: vars.spacing.lg,
  '@media': {
    [`(max-width: ${themeBreakpoints.md})`]: { flexDirection: 'column' },
  },
});

globalStyle(`${enhancedListViewItem} .content`, {
  flex: 3,
  display: 'flex',
  flexDirection: 'column',
});

globalStyle(`${enhancedListViewItem} .actions`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flex: 1,
  paddingLeft: vars.spacing.md,
  '@media': {
    [`(max-width: ${themeBreakpoints.md})`]: {
      paddingLeft: '0',
      paddingTop: vars.spacing.md,
    },
  },
});

// Overrides CardGrid's own `grid-template-columns` / `gap` -- relies on this
// module being evaluated after `@pairflix/components` (see the import order
// in SearchMedia.tsx) so these rules land later in the stylesheet and win.
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

export const searchControls = style({
  display: 'flex',
  gap: vars.spacing.md,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: vars.spacing.lg,
});

export const searchStatusMessage = style({
  textAlign: 'center',
  marginTop: vars.spacing.xl,
});

export const searchInputGroup = style({
  flex: 1,
});

export const performanceInfo = style({
  marginBottom: vars.spacing.md,
  opacity: 0.7,
});

export const addedMessage = style({
  color: 'green',
  textAlign: 'center',
  marginTop: vars.spacing.md,
  padding: vars.spacing.sm,
  backgroundColor: '#f0f9ff',
  borderRadius: vars.borderRadius.sm,
});
