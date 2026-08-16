import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const loginContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: vars.colors.background.primary,
});

export const loginCard = style({
  width: '100%',
  maxWidth: '400px',
});

export const loginForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});
