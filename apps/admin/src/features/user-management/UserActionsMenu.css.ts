import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const menuContainer = style({
  position: 'relative',
  display: 'inline-block',
});

export const menuButton = style({
  padding: '6px 12px',
  minWidth: 'auto',
});

export const menuDropdown = recipe({
  base: {
    position: 'absolute',
    right: 0,
    zIndex: 10,
    minWidth: '200px',
    background: vars.colors.background.primary,
    border: `1px solid ${vars.colors.border}`,
    borderRadius: vars.borderRadius.sm,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  variants: {
    isOpen: {
      true: { display: 'block' },
      false: { display: 'none' },
    },
  },
  defaultVariants: {
    isOpen: false,
  },
});

export const menuItem = recipe({
  base: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  variants: {
    danger: {
      true: {
        color: vars.colors.text.error,
        selectors: {
          '&:hover': { background: vars.colors.background.hover },
        },
      },
      false: {
        color: vars.colors.text.primary,
        selectors: {
          '&:hover': { background: vars.colors.background.hover },
        },
      },
    },
  },
  defaultVariants: {
    danger: false,
  },
});

export const menuDivider = style({
  height: '1px',
  background: vars.colors.border,
  margin: '4px 0',
});

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

export const dialogText = style({
  marginBottom: '24px',
});

export const dialogInput = style({
  width: '100%',
  padding: '8px 12px',
  marginBottom: '16px',
  border: `1px solid ${vars.colors.border}`,
  borderRadius: vars.borderRadius.sm,
});

export const dialogActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
});
