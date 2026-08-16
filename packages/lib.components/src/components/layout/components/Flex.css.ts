import { globalStyle, style } from '@vanilla-extract/css';
import { media } from '../utils/responsive';

export const flex = style({
  flexDirection: 'var(--flex-direction-base)',
  gap: 'var(--flex-gap-base)',
  '@media': {
    [media.tablet]: {
      flexDirection: 'var(--flex-direction-tablet)',
    },
    [media.mobile]: {
      flexDirection: 'var(--flex-direction-mobile)',
      gap: 'var(--flex-gap-mobile)',
    },
  },
});

// Common pattern: row layouts (or an explicit column override on mobile)
// stretch their direct children to full width once stacked on mobile.
// `selectors` can only target the class itself (or another known class), so
// an unscoped `> *` descendant rule has to go through `globalStyle`.
export const mobileStretchChildren = style({});

globalStyle(`${mobileStretchChildren} > *`, {
  '@media': {
    [media.mobile]: {
      width: '100%',
    },
  },
});
