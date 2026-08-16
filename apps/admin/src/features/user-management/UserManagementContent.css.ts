import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const notificationContainer = style({
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1000,
});

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-10px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const notificationItem = recipe({
  base: {
    color: 'white',
    padding: '12px 20px',
    borderRadius: '4px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    animation: `${fadeIn} 0.3s ease-in-out`,
  },
  variants: {
    type: {
      success: { backgroundColor: vars.colors.text.success },
      error: { backgroundColor: vars.colors.text.error },
    },
  },
  defaultVariants: {
    type: 'success',
  },
});

export const pageHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

export const pageTitle = style({
  fontSize: '24px',
  margin: 0,
});

export const paginationWrapper = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
});

export const paginationInfo = style({
  fontSize: '14px',
});

export const loadingIndicator = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
  width: '100%',
});
