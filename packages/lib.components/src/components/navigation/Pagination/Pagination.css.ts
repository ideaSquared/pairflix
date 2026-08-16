import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const buttonGap = style({
  gap: vars.spacing.sm,
});

export const largeButton = style({
  minWidth: '48px',
  padding: '12px',
});
