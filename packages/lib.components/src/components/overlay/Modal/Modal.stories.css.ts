import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const container = style({
  padding: '24px',
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});

export const groupRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '24px',
  marginBottom: '24px',
});

export const sectionTitle = style({
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: 500,
});

export const sectionDescription = style({
  margin: '0 0 16px 0',
  color: vars.colors.text.secondary,
  fontSize: '14px',
});

export const itemContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const itemLabel = style({
  fontSize: '14px',
  color: vars.colors.text.secondary,
});

export const card = style({
  padding: '16px',
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: vars.colors.background.card,
  marginBottom: '16px',
});

export const actionButton = style({
  padding: '8px 16px',
  backgroundColor: vars.colors.primary,
  color: 'white',
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primaryHover,
    },
    '&:focus': {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: '2px',
    },
  },
});

export const codeBlock = style({
  backgroundColor: vars.colors.background.secondary,
  padding: '16px',
  borderRadius: vars.borderRadius.md,
  overflow: 'auto',
  fontFamily: 'monospace',
  fontSize: '14px',
  lineHeight: 1.5,
});

// Smaller sub-heading used for in-story sub-sections.
export const subsectionTitle = style({
  fontSize: '16px',
});

export const subsectionTitleWithMarginTop = style({
  fontSize: '16px',
  marginTop: '16px',
});

export const dangerButton = style({
  backgroundColor: '#e53935',
  selectors: {
    '&:hover': { backgroundColor: '#c62828' },
  },
});

export const successButton = style({
  backgroundColor: '#4caf50',
  selectors: {
    '&:hover': { backgroundColor: '#43a047' },
  },
});
