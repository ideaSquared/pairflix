import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const verificationContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: vars.colors.background.primary,
});

export const verificationCard = style({
  width: '100%',
  maxWidth: '500px',
  textAlign: 'center',
});

export const iconWrapper = style({
  fontSize: '3rem',
  marginBottom: '1rem',
});

export const actionLinks = style({
  marginTop: '1.5rem',
  color: vars.colors.text.secondary,
});

globalStyle(`${actionLinks} > *`, {
  margin: '0 0.5rem',
});
