import { style } from '@vanilla-extract/css';

// Dev-only viewport indicator for the stories below -- not part of the
// component itself, purely a Storybook documentation aid.
export const responsiveIndicator = style({
  position: 'fixed',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '4px 8px',
  fontSize: '12px',
  borderRadius: '4px',
  zIndex: 1000,
  '@media': {
    '(max-width: 480px)': {
      backgroundColor: '#f44336',
      selectors: {
        '&::after': { content: '"Mobile View"' },
      },
    },
    '(min-width: 481px) and (max-width: 768px)': {
      backgroundColor: '#ff9800',
      selectors: {
        '&::after': { content: '"Tablet View"' },
      },
    },
    '(min-width: 769px) and (max-width: 1024px)': {
      backgroundColor: '#4caf50',
      selectors: {
        '&::after': { content: '"Desktop View"' },
      },
    },
    '(min-width: 1025px)': {
      backgroundColor: '#2196f3',
      selectors: {
        '&::after': { content: '"Large Desktop View"' },
      },
    },
  },
});
