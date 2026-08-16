import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// Fixed label styling for the ColorBox demo helper below -- every ColorBox
// instance in these stories uses the same white/bold/14px text.
export const colorBoxText = style({
  color: 'white',
  fontWeight: 500,
  fontSize: 14,
});

// Centers the "Center" demo Box within its absolutely-positioned parent.
export const centerTransform = style({
  transform: 'translate(-50%, -50%)',
});

// Dev-only section heading used throughout these stories -- not part of the
// component itself, purely a Storybook documentation aid.
export const sectionTitle = recipe({
  base: {
    margin: '0 0 16px 0',
    fontWeight: 500,
  },
  variants: {
    small: {
      true: { fontSize: 16 },
      false: { fontSize: 18 },
    },
  },
  defaultVariants: {
    small: false,
  },
});
