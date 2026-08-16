import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const resetPasswordContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: vars.colors.background.primary,
});

export const resetPasswordCard = style({
  width: '100%',
  maxWidth: '400px',
});

export const backToLoginLink = style({
  textAlign: 'center',
  marginTop: '1rem',
  color: vars.colors.text.secondary,
});
