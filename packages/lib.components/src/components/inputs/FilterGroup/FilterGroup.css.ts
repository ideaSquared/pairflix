import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';

export const filterGroupCard = recipe({
  base: {
    marginBottom: vars.spacing.lg,
  },
  variants: {
    isFullWidth: {
      true: { width: '100%' },
      false: { width: 'auto' },
    },
  },
  defaultVariants: {
    isFullWidth: false,
  },
});

export const filtersGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: vars.spacing.md,
  marginTop: vars.spacing.md,
  '@media': {
    [`(max-width: ${breakpoints.sm})`]: {
      gridTemplateColumns: '1fr',
    },
  },
});

export const filterHeader = style({
  display: 'flex',
  marginBottom: vars.spacing.md,
  borderBottom: `1px solid ${vars.colors.border}`,
  paddingBottom: vars.spacing.sm,
});

export const filterActions = style({
  display: 'flex',
  marginTop: vars.spacing.md,
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

// The Apply button's original inline `style={{ marginRight: '0.5rem' }}` --
// pulled out because inline `style` is forbidden on components (eslint
// react/forbid-component-props). 0.5rem === vars.spacing.sm.
export const applyButtonSpacing = style({
  marginRight: vars.spacing.sm,
});

export const filterContent = recipe({
  base: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out',
    willChange: 'max-height, opacity',
  },
  variants: {
    isExpanded: {
      true: { maxHeight: '2000px', opacity: 1 },
      false: { maxHeight: '0', opacity: 0 },
    },
  },
  defaultVariants: {
    isExpanded: true,
  },
});

export const filterLabel = recipe({
  base: {
    display: 'block',
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    marginBottom: vars.spacing.xs,
    color: vars.colors.text.secondary,
  },
  variants: {
    required: {
      true: {
        selectors: {
          '&::after': {
            content: '"*"',
            color: vars.colors.text.error,
            marginLeft: '4px',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    required: false,
  },
});

export const helpText = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  marginTop: vars.spacing.xs,
});

export const errorText = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.error,
  marginTop: vars.spacing.xs,
});
