import { style } from '@vanilla-extract/css';

// Dev-only demo wrapper for the "Loading in cards" story below -- not part
// of the component itself, purely a Storybook documentation aid.
export const centeredCard = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '150px',
});
