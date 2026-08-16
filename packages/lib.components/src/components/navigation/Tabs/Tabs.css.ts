import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const container = recipe({
  base: {
    display: 'flex',
    width: '100%',
  },
  variants: {
    vertical: {
      true: { flexDirection: 'row' },
      false: { flexDirection: 'column' },
    },
  },
  defaultVariants: { vertical: false },
});

export const tabList = recipe({
  base: {
    display: 'flex',
    gap: vars.spacing.sm,
  },
  variants: {
    vertical: {
      true: {
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0',
      },
      false: {
        flexDirection: 'row',
        borderBottom: '1px solid #e0e0e0',
      },
    },
  },
  defaultVariants: { vertical: false },
});

export const tabButton = recipe({
  base: {
    padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: vars.typography.fontSize.md,
    borderBottom: 'none',
    borderRight: 'none',
    transition: 'color 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        color: vars.colors.primary,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: '-2px',
      },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    },
  },
  variants: {
    selected: {
      true: { color: vars.colors.primary },
      false: { color: vars.colors.text.primary },
    },
    vertical: {
      true: { marginBottom: 0, marginRight: '-1px' },
      false: { marginBottom: '-1px', marginRight: 0 },
    },
  },
  compoundVariants: [
    {
      variants: { selected: true, vertical: false },
      style: { borderBottom: `2px solid ${vars.colors.primary}` },
    },
    {
      variants: { selected: true, vertical: true },
      style: { borderRight: `2px solid ${vars.colors.primary}` },
    },
  ],
  defaultVariants: { selected: false, vertical: false },
});

export const tabPanel = style({
  padding: vars.spacing.md,
  flex: 1,
});
