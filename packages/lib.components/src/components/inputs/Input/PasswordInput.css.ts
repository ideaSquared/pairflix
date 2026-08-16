import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const toggleButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary}`,
      borderRadius: '4px',
    },
  },
});
