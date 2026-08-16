import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// Local SectionTitle helper (defined in Flex.stories.tsx). `small` matches
// the fontSize-only override used for the first sub-heading in a section;
// `spaced` adds the extra top margin used for subsequent sub-headings.
export const sectionTitle = recipe({
  base: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 500,
  },
  variants: {
    small: {
      true: { fontSize: 16 },
      false: {},
    },
    spaced: {
      true: { marginTop: '24px' },
      false: {},
    },
  },
  defaultVariants: {
    small: false,
    spaced: false,
  },
});

// Card Layout demo: clips the card image to the card's rounded corners and
// caps the card's width.
export const cardLayoutWrapper = style({
  overflow: 'hidden',
  maxWidth: '320px',
});

// Form Layout demo wrapper.
export const formLayoutWrapper = style({
  maxWidth: '400px',
});

// Center Alignment demo: caps the width of the centered content block.
export const centeredContentWrapper = style({
  maxWidth: '300px',
});
