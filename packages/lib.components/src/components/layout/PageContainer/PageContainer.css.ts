import { recipe } from '@vanilla-extract/recipes';
import { breakpoints } from '../../../styles/theme';
import { vars } from '../../../styles/theme.css';
import { media } from '../utils/responsive';

export const pageContainer = recipe({
  base: {
    width: '100%',
  },
  variants: {
    centered: {
      true: { marginLeft: 'auto', marginRight: 'auto' },
      false: { marginLeft: '0', marginRight: '0' },
    },
    fullHeight: {
      true: { height: '100%' },
      false: { height: 'auto' },
    },
    maxWidth: {
      sm: { maxWidth: breakpoints.sm },
      md: { maxWidth: breakpoints.md },
      lg: { maxWidth: breakpoints.lg },
      xl: { maxWidth: breakpoints.xl },
      xxl: { maxWidth: breakpoints.xxl },
      full: { maxWidth: '100%' },
    },
    padding: {
      none: {},
      sm: { padding: vars.spacing.sm },
      md: { padding: vars.spacing.md },
      lg: { padding: vars.spacing.lg },
      xl: { padding: vars.spacing.xl },
    },
    // Only used to match compoundVariants below -- `responsive` has no
    // direct styling of its own, it just gates the padding downgrades.
    responsive: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { padding: 'sm', responsive: true },
      style: {
        '@media': {
          [media.md]: { padding: vars.spacing.sm },
          [media.sm]: { padding: vars.spacing.sm },
        },
      },
    },
    {
      variants: { padding: 'md', responsive: true },
      style: {
        '@media': {
          [media.md]: { padding: vars.spacing.sm },
          [media.sm]: { padding: vars.spacing.sm },
        },
      },
    },
    {
      variants: { padding: 'lg', responsive: true },
      style: {
        '@media': {
          [media.md]: { padding: vars.spacing.md },
          [media.sm]: { padding: vars.spacing.sm },
        },
      },
    },
    {
      variants: { padding: 'xl', responsive: true },
      style: {
        '@media': {
          [media.md]: { padding: vars.spacing.md },
          [media.sm]: { padding: vars.spacing.sm },
        },
      },
    },
  ],
  defaultVariants: {
    centered: true,
    fullHeight: false,
    maxWidth: 'lg',
    padding: 'md',
    responsive: true,
  },
});
