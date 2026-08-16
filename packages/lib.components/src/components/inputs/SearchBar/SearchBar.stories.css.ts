import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const container = style({
  padding: '24px',
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const resultsContainer = style({
  marginTop: '16px',
  padding: '16px',
  backgroundColor: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.colors.border}`,
});

export const section = style({
  marginBottom: '32px',
});

export const sectionTitle = style({
  marginBottom: '16px',
  fontSize: '18px',
  fontWeight: 500,
});

export const divider = style({
  margin: '32px 0',
  border: 0,
  borderTop: `1px solid ${vars.colors.border}`,
});

export const description = style({
  marginBottom: '16px',
  color: vars.colors.text.secondary,
  fontSize: '14px',
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '24px',
});
