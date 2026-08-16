import { style } from '@vanilla-extract/css';
import { media } from '../utils/responsive';

// `grid-template-columns` is fully prop-driven at every tier (there's no
// fixed theme enum for `columns`), so the component computes the effective
// value for each tier in JS and hands it down as a custom property --
// `desktop` already covers the `largeDesktop` range too (min-width: 1600px
// is a subset of min-width: 992px) and both resolved to the same formula in
// the original, so that tier was redundant and is folded into `desktop`.
export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'var(--grid-cols-base)',
  '@media': {
    [media.desktop]: {
      gridTemplateColumns: 'var(--grid-cols-desktop)',
    },
    [media.tablet]: {
      gridTemplateColumns: 'var(--grid-cols-tablet)',
    },
    [media.mobile]: {
      gridTemplateColumns: 'var(--grid-cols-mobile)',
    },
  },
});
