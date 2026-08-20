import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

// A soft glow behind the hero, tinted from the theme's own primary color via color-mix so it
// tracks light/dark automatically -- rgba() can't blend a CSS custom property, color-mix can.
export const page = style({
  background: `radial-gradient(1100px 480px at 50% -10%, color-mix(in srgb, ${vars.colors.primary} 18%, transparent), transparent 70%)`,
});

export const hero = style({
  textAlign: 'center',
  maxWidth: '640px',
  margin: '0 auto',
  paddingTop: vars.spacing.xl,
});

export const eyebrow = style({
  marginBottom: vars.spacing.lg,
});

export const heroTitle = style({
  fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
  fontWeight: vars.typography.fontWeight.bold,
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  margin: 0,
});

export const heroSubtitle = style({
  marginTop: vars.spacing.md,
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.lg,
});

export const layout = style({
  marginTop: vars.spacing.xl,
});

export const valueProps = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const valueProp = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
  fontSize: vars.typography.fontSize.md,
});

export const valuePropDot = style({
  flexShrink: 0,
  marginTop: '7px',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: vars.colors.primary,
});

export const reassurance = style({
  marginTop: vars.spacing.lg,
  color: vars.colors.text.secondary,
});

export const demoColumn = style({
  minWidth: 0,
});

export const formSection = style({
  marginBottom: vars.spacing.lg,
});

export const label = style({
  marginBottom: vars.spacing.sm,
  fontWeight: vars.typography.fontWeight.bold,
});

export const chip = recipe({
  base: {
    padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: vars.typography.fontSize.sm,
    fontWeight: vars.typography.fontWeight.medium,
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
  variants: {
    selected: {
      true: {
        border: `1px solid ${vars.colors.primary}`,
        background: vars.colors.primary,
        color: '#ffffff',
        boxShadow: vars.shadows.sm,
        selectors: {
          '&:hover': { background: vars.colors.primary },
        },
      },
      false: {
        border: `1px solid ${vars.colors.border}`,
        background: 'transparent',
        color: vars.colors.text.primary,
        selectors: {
          '&:hover': {
            background: vars.colors.background.secondary,
            borderColor: vars.colors.primary,
          },
        },
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const sliderRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  margin: `${vars.spacing.md} 0`,
});

export const slider = style({
  flex: 1,
  accentColor: vars.colors.primary,
});

export const pickButton = style({
  marginTop: vars.spacing.sm,
  fontSize: vars.typography.fontSize.lg,
  boxShadow: vars.shadows.md,
  transition: 'transform 0.15s ease',
  selectors: {
    '&:hover:not(:disabled)': { transform: 'translateY(-1px)' },
  },
});

export const microcopy = style({
  marginTop: vars.spacing.sm,
  textAlign: 'center',
});

export const errorMessage = style({
  marginTop: vars.spacing.md,
});

export const usedTodayCard = style({
  textAlign: 'center',
});

export const signupCta = style({
  marginTop: vars.spacing.lg,
});

export const loginLink = style({
  textAlign: 'center',
  marginTop: vars.spacing.xl,
});
