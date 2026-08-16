import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const container = style({
  padding: '24px',
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const sectionTitle = style({
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: 500,
});

export const sectionTitleCompact = style({
  fontSize: '16px',
});

export const sectionTitleCompactSpaced = style({
  fontSize: '16px',
  marginBottom: '12px',
});

export const sectionDescription = style({
  margin: '0 0 16px 0',
  color: vars.colors.text.secondary,
  fontSize: '14px',
});

export const sectionDescriptionSpaced = style({
  marginTop: '16px',
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '24px',
});

export const formGroup = style({
  marginBottom: '24px',
});

export const card = style({
  padding: '16px',
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: vars.colors.background.card,
});

export const statusDisplay = style({
  marginTop: '16px',
  padding: '12px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.background.secondary,
  fontFamily: 'monospace',
  fontSize: '14px',
});
