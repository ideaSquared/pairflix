import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const tableContainer = style({
  width: '100%',
  overflowX: 'auto',
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.colors.border}`,
  backgroundColor: vars.colors.background.paper,
  position: 'relative',
});

export const table = style({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
});

export const tableHead = recipe({
  base: {},
  variants: {
    sticky: {
      true: {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: vars.colors.background.paper,
      },
      false: {},
    },
  },
  defaultVariants: { sticky: false },
});

const cellBase = {
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.colors.border}`,
} as const;

const alignVariants = {
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
} as const;

export const tableHeaderCell = recipe({
  base: {
    ...cellBase,
    backgroundColor: vars.colors.background.paper,
    fontWeight: vars.typography.fontWeight.medium,
    color: vars.colors.text.primary,
    transition: 'background-color 0.2s',
  },
  variants: {
    align: alignVariants,
    sortable: {
      true: {
        cursor: 'pointer',
        userSelect: 'none',
        selectors: {
          '&:hover': { backgroundColor: vars.colors.background.hover },
        },
      },
      false: {},
    },
  },
  defaultVariants: { align: 'left', sortable: false },
});

export const tableCell = recipe({
  base: {
    ...cellBase,
    color: vars.colors.text.primary,
  },
  variants: {
    align: alignVariants,
  },
  defaultVariants: { align: 'left' },
});

export const tableRow = recipe({
  base: {
    transition: 'background-color 0.2s',
  },
  variants: {
    selectable: {
      true: { cursor: 'pointer' },
      false: {},
    },
    selected: {
      true: { backgroundColor: vars.colors.background.highlight },
      false: {},
    },
    clickable: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': { backgroundColor: vars.colors.background.hover },
        },
      },
      false: {},
    },
  },
  defaultVariants: { selectable: false, selected: false, clickable: false },
});

export const loadingOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
});

export const emptyState = style({
  padding: vars.spacing.xl,
  textAlign: 'center',
  color: vars.colors.text.secondary,
});

export const sortIcon = recipe({
  base: {
    display: 'inline-block',
    marginLeft: vars.spacing.xs,
    transition: 'opacity 0.2s',
  },
  variants: {
    direction: {
      asc: { opacity: 1, selectors: { '&:after': { content: '"↑"' } } },
      desc: { opacity: 1, selectors: { '&:after': { content: '"↓"' } } },
      none: { opacity: 0.3, selectors: { '&:after': { content: '"↓"' } } },
    },
  },
  defaultVariants: { direction: 'none' },
});

export const tableBody = style({
  backgroundColor: vars.colors.background.paper,
});

export const tableActionButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    margin: '0 2px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    selectors: {
      '&:hover, &:focus': { opacity: 0.9 },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    },
  },
  variants: {
    variant: {
      primary: { backgroundColor: vars.colors.primary, color: '#ffffff' },
      secondary: { backgroundColor: vars.colors.secondary, color: '#ffffff' },
      warning: { backgroundColor: vars.colors.text.warning, color: '#ffffff' },
      danger: { backgroundColor: vars.colors.text.error, color: '#ffffff' },
      default: {
        backgroundColor: vars.colors.background.secondary,
        color: vars.colors.text.primary,
      },
    },
  },
  defaultVariants: { variant: 'default' },
});
