import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

const TRACK_SIZE = {
  small: { width: '32px', height: '18px' },
  medium: { width: '44px', height: '24px' },
  large: { width: '56px', height: '30px' },
} as const;

const THUMB_SIZE = {
  small: '14px',
  medium: '20px',
  large: '26px',
} as const;

type SwitchSize = keyof typeof TRACK_SIZE;

export const switchWrapper = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
  },
  variants: {
    disabled: {
      true: { cursor: 'not-allowed', opacity: 0.6 },
      false: { cursor: 'pointer', opacity: 1 },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const switchTrack = recipe({
  base: {
    position: 'relative',
    display: 'inline-block',
    borderRadius: '999px',
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover:not([data-disabled="true"])': { opacity: 0.8 },
    },
  },
  variants: {
    size: {
      small: TRACK_SIZE.small,
      medium: TRACK_SIZE.medium,
      large: TRACK_SIZE.large,
    },
    // The checked+custom-color combination is applied as an inline style by
    // the component (an arbitrary caller-supplied color can't be baked into
    // a static class) -- this variant only supplies the default.
    checked: {
      true: { background: vars.colors.primary },
      false: { background: vars.colors.border },
    },
  },
  defaultVariants: {
    size: 'medium',
    checked: false,
  },
});

export const switchThumb = recipe({
  base: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    background: 'white',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  variants: {
    size: {
      small: { width: THUMB_SIZE.small, height: THUMB_SIZE.small },
      medium: { width: THUMB_SIZE.medium, height: THUMB_SIZE.medium },
      large: { width: THUMB_SIZE.large, height: THUMB_SIZE.large },
    },
    checked: {
      true: {},
      false: { transform: 'translateX(0)' },
    },
  },
  // Object.keys() widens to string[]; safe here since THUMB_SIZE's keys are
  // exactly SwitchSize by construction (the `as const` above).
  compoundVariants: (Object.keys(THUMB_SIZE) as SwitchSize[]).map(size => ({
    variants: { checked: true as const, size },
    style: { transform: `translateX(${THUMB_SIZE[size]})` },
  })),
  defaultVariants: {
    size: 'medium',
    checked: false,
  },
});

export const switchInput = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const switchLabel = style({
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.md,
});
