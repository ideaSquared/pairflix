import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const contentTypeBadge = style({
  textTransform: 'capitalize',
});

export const subHeading = style({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
});

export const styledCard = style({
  marginBottom: '10px',
  padding: '15px',
});

export const alertSpacing = style({
  marginBottom: '1rem',
});

export const filterBar = style({
  marginBottom: '1rem',
});

export const resultsCount = style({
  margin: '1rem 0',
});

export const pageIndicator = style({
  alignSelf: 'center',
});

export const modalFooter = style({
  marginTop: '20px',
});

export const fieldLabel = style({
  marginBottom: '8px',
});

export const contentTypeHint = style({
  marginTop: '4px',
  fontSize: '0.875rem',
  color: '#666',
});

export const reporterName = style({
  fontWeight: vars.typography.fontWeight.bold,
});

export const reportMeta = style({
  marginTop: '8px',
});

// Hand-rolled dialog (matches CreateUserModal.css.ts) -- the shared Modal
// portals to document.body, outside the div ThemeProvider puts its theme
// class on, so it renders with no theme variables. See CreateUserModal.tsx.
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
