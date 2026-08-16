import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const registerContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: vars.colors.background.primary,
});

export const registerCard = style({
  width: '100%',
  maxWidth: '400px',
});

export const registerForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const loginLink = style({
  textAlign: 'center',
  marginTop: '1rem',
  color: vars.colors.text.secondary,
});

export const successContainer = style({
  textAlign: 'center',
});

export const iconWrapper = style({
  fontSize: '3rem',
  marginBottom: '1rem',
});

export const successHeading = style({
  marginBottom: '1rem',
});

export const successMessageSpacing = style({
  marginBottom: '1rem',
});

export const createAccountHeading = style({
  textAlign: 'center',
  marginBottom: '2rem',
});
