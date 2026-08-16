import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const pulse = keyframes({
  '0%': { opacity: 0.6 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.6 },
});

// size/thickness/color/trackColor/speed are all arbitrary per-instance
// values applied via inline style -- only the parts that never vary live
// here.
export const spinner = style({
  borderStyle: 'solid',
  borderRadius: '50%',
  animationName: spin,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
});

export const loadingContainer = style({
  padding: vars.spacing.xl,
});

export const fullScreenContainer = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.colors.background.primary,
  zIndex: 1000,
});

export const loadingMessage = style({
  animation: `${pulse} 1.5s ease-in-out infinite`,
});
