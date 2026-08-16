import { style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const container = style({
  marginBottom: vars.spacing.xl,
});

export const importExportCard = style({
  marginBottom: vars.spacing.lg,
});

export const hiddenInput = style({
  display: 'none',
});

export const fileUploadLabel = style({
  display: 'inline-block',
  cursor: 'pointer',
});
