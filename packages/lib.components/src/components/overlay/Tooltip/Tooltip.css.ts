import { keyframes, style } from '@vanilla-extract/css';
import { layoutTokens } from '../../layout/utils/responsive';
import { vars } from '../../../styles/theme.css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

export const content = style({
  background: vars.colors.text.primary,
  color: '#fff',
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSize.sm,
  boxShadow: vars.shadows.sm,
  zIndex: layoutTokens.tooltip.zIndex,
  userSelect: 'none',
  pointerEvents: 'auto',
  selectors: {
    '&[data-state="delayed-open"]': {
      animation: `${fadeIn} 0.2s ease-out`,
    },
  },
});

export const arrow = style({
  fill: vars.colors.text.primary,
});
