import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const fadeOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-20px)' },
});

export const toast = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: vars.spacing.md,
    borderRadius: vars.borderRadius.sm,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    animation: `${fadeIn} 0.3s ease-out`,
    minWidth: '300px',
    maxWidth: '500px',
    color: '#ffffff',
    '@media': {
      [`(max-width: ${breakpoints.sm})`]: { minWidth: 'unset', width: '100%' },
    },
  },
  variants: {
    variant: {
      info: { background: vars.colors.primary },
      success: { background: vars.colors.text.success },
      warning: { background: vars.colors.text.warning },
      error: { background: vars.colors.text.error },
    },
    isExiting: {
      true: { animation: `${fadeOut} 0.3s ease-in forwards` },
      false: {},
    },
  },
  defaultVariants: { variant: 'info', isExiting: false },
});

export const closeButton = style({
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: vars.spacing.xs,
  marginLeft: vars.spacing.sm,
  opacity: 0.7,
  transition: 'opacity 0.2s ease',
  selectors: {
    '&:hover': { opacity: 1 },
    '&:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '2px',
    },
  },
});

export const toastMessage = style({
  flex: 1,
  marginRight: vars.spacing.sm,
  fontSize: vars.typography.fontSize.sm,
});
