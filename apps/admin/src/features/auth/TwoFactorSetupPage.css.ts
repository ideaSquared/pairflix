import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const setupContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: vars.colors.background.primary,
});

export const setupCard = style({
  width: '100%',
  maxWidth: '480px',
});

export const setupForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const secretBlock = style({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  padding: '0.75rem',
  borderRadius: '4px',
  background: vars.colors.background.secondary,
  wordBreak: 'break-all',
  userSelect: 'all',
});

export const backupCodeList = style({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  padding: '0.75rem',
  borderRadius: '4px',
  background: vars.colors.background.secondary,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
  userSelect: 'all',
});
