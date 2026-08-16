import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const sessionWarning = style({
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  color: vars.colors.text.warning,
  padding: '12px 16px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  maxWidth: '350px',
  fontSize: '14px',
});

export const warningActions = style({
  marginTop: '8px',
  display: 'flex',
  gap: '8px',
});

export const warningButton = style({
  background: vars.colors.primary,
  color: 'white',
  border: 'none',
  padding: '4px 12px',
  borderRadius: '3px',
  fontSize: '12px',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
