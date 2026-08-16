import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const tagInputContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const tagInputField = style({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
  padding: '0.5rem',
  background: vars.colors.background.primary,
  marginBottom: '0.5rem',
});

export const tagTextInput = style({
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: vars.typography.fontSize.md,
  color: vars.colors.text.primary,
  selectors: {
    '&::placeholder': { color: vars.colors.text.secondary },
  },
});

export const tagsContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.5rem',
});

export const tag = style({
  display: 'flex',
  alignItems: 'center',
  background: vars.colors.primary,
  color: 'white',
  borderRadius: vars.borderRadius.sm,
  padding: '0.25rem 0.5rem',
  fontSize: vars.typography.fontSize.sm,
  userSelect: 'none',
});

export const removeTagButton = style({
  background: 'none',
  border: 'none',
  color: 'white',
  marginLeft: '0.25rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  padding: '0 0.25rem',
  fontSize: vars.typography.fontSize.sm,
  selectors: {
    '&:hover': { opacity: 0.8 },
    '&:focus': { outline: 'none' },
  },
});

export const helperText = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.sm,
  margin: '0.25rem 0',
});
