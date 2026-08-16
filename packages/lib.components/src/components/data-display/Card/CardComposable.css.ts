import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

export const cardHeader = recipe({
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: vars.spacing.md,
    color: vars.colors.text.primary,
    fontWeight: vars.typography.fontWeight.medium,
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: { padding: vars.spacing.sm },
    },
  },
  variants: {
    withDivider: {
      true: { borderBottom: `1px solid ${vars.colors.border}` },
      false: {},
    },
  },
  defaultVariants: { withDivider: true },
});

export const cardContent = recipe({
  base: {
    color: vars.colors.text.primary,
  },
  variants: {
    noPadding: {
      true: { padding: 0 },
      false: {
        padding: vars.spacing.md,
        '@media': {
          [`(max-width: ${breakpoints.sm})`]: { padding: vars.spacing.sm },
        },
      },
    },
  },
  defaultVariants: { noPadding: false },
});

export const cardFooter = recipe({
  base: {
    padding: vars.spacing.md,
    background: vars.colors.background.secondary,
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: { padding: vars.spacing.sm },
    },
  },
  variants: {
    withDivider: {
      true: { borderTop: `1px solid ${vars.colors.border}` },
      false: {},
    },
  },
  defaultVariants: { withDivider: true },
});

export const cardMedia = style({
  position: 'relative',
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
});

export const mediaImage = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// `minCardWidth`/`gap` are arbitrary per-instance values, so the grid can't
// bake them into a static class. Plain (non-vanilla-extract) CSS custom
// properties let the component set them inline while the responsive
// breakpoints below stay expressible as ordinary static CSS.
export const cardGridVars = {
  minCardWidth: '--pf-card-grid-min-width',
  gap: '--pf-card-grid-gap',
};

export const cardGrid = style({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(var(${cardGridVars.minCardWidth}), 1fr))`,
  gap: `var(${cardGridVars.gap}, ${vars.spacing.md})`,
  width: '100%',
  '@media': {
    [`(max-width: ${breakpoints.md})`]: {
      gridTemplateColumns: `repeat(auto-fill, minmax(max(calc(var(${cardGridVars.minCardWidth}) * 0.85), 180px), 1fr))`,
      gap: `var(${cardGridVars.gap}, ${vars.spacing.sm})`,
    },
    [`(max-width: ${breakpoints.sm})`]: {
      gridTemplateColumns: '1fr',
      gap: `var(${cardGridVars.gap}, ${vars.spacing.sm})`,
    },
  },
});
