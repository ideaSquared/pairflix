import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const container = style({
  padding: '24px',
  maxWidth: '600px',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const groupRow = style({
  display: 'flex',
  flexWrap: 'wrap',
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
  marginBottom: '24px',
});

export const sectionDescription = style({
  margin: '0 0 16px 0',
  color: vars.colors.text.secondary,
  fontSize: '14px',
});

export const sectionDescriptionSpaced = style({
  marginTop: '16px',
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
});

export const settingsGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '16px',
});

export const settingItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px',
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': { backgroundColor: vars.colors.background.hover },
  },
});

export const settingLabel = style({
  fontSize: '16px',
});

export const statusDisplay = style({
  marginTop: '16px',
  padding: '12px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.background.secondary,
  fontFamily: 'monospace',
  fontSize: '14px',
});
