import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

export const body = recipe({
  base: {
    flex: 1,
    overflowY: 'auto',
  },
  variants: {
    noPadding: {
      true: { marginBottom: 0, padding: 0 },
      false: { marginBottom: vars.spacing.md },
    },
  },
  defaultVariants: { noPadding: false },
});

export const footer = recipe({
  base: {
    display: 'flex',
    gap: vars.spacing.md,
    marginTop: vars.spacing.lg,
    '@media': {
      '(max-width: 576px)': {
        flexDirection: 'column',
        gap: vars.spacing.sm,
      },
    },
  },
  variants: {
    withDivider: {
      true: { borderTop: '1px solid #e0e0e0', paddingTop: vars.spacing.md },
      false: {},
    },
  },
  defaultVariants: { withDivider: true },
});
