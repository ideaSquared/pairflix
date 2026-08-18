import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const dialogOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

export const dialogContent = style({
  background: vars.colors.background.primary,
  borderRadius: vars.borderRadius.md,
  padding: '24px',
  width: '400px',
  maxWidth: '90%',
});

export const dialogTitle = style({
  marginTop: 0,
  marginBottom: '16px',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const dialogActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '16px',
});
