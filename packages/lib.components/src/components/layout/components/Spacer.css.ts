import { style } from '@vanilla-extract/css';
import { media } from '../utils/responsive';

export const spacerBlock = style({
  height: 'var(--spacer-size-base)',
  width: '100%',
  flexShrink: 0,
  '@media': {
    [media.tablet]: { height: 'var(--spacer-size-tablet)' },
    [media.mobile]: { height: 'var(--spacer-size-mobile)' },
  },
});

export const spacerInline = style({
  height: 'auto',
  width: 'var(--spacer-size-base)',
  flexShrink: 0,
  '@media': {
    [media.tablet]: { width: 'var(--spacer-size-tablet)' },
    [media.mobile]: { width: 'var(--spacer-size-mobile)' },
  },
});

export const hideOnMobileClass = style({
  '@media': {
    [media.mobile]: { display: 'none' },
  },
});
