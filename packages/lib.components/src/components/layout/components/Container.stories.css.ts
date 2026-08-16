import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// Dev-only demo helpers for these stories -- not part of the Container
// component itself. Only backgroundColor/paddingTop/paddingBottom/marginTop
// are used here, none of which Container's own class ever sets, so these
// compose safely alongside it regardless of stylesheet order.

export const containerBgLight = style({
  backgroundColor: '#f5f5f5',
});

export const containerMarginTop = style({
  marginTop: '24px',
});

// Nested-container demo: horizontal padding still comes from Container's own
// `padding` prop (kept in sync with these values at each call site) -- these
// classes only add the vertical padding and background tint.
export const containerBgOuter = style({
  backgroundColor: '#f0f0f0',
  paddingTop: '24px',
  paddingBottom: '24px',
});

export const containerBgInner = style({
  backgroundColor: '#e0e0e0',
  paddingTop: '16px',
  paddingBottom: '16px',
});

export const containerBgInnermost = style({
  backgroundColor: '#d0d0d0',
  paddingTop: '16px',
  paddingBottom: '16px',
});

// Local SectionTitle helper (defined in Container.stories.tsx) -- `small` is
// used for the sub-headings inside the "Common Use Cases" story.
export const sectionTitle = recipe({
  base: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 500,
  },
  variants: {
    small: {
      true: { margin: '24px 0 16px 0', fontSize: 16 },
      false: {},
    },
  },
  defaultVariants: {
    small: false,
  },
});

// Local ContentBlock helper (defined in Container.stories.tsx). `bgColor`
// stays a per-call-site inline value (arbitrary demo colors); everything
// else is one of these fixed shapes.
const contentBlockBase = {
  padding: 16,
  borderRadius: 8,
  width: '100%',
  minHeight: 80,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
} as const;

export const contentBlock = style(contentBlockBase);

export const contentBlockTallContent = style({
  ...contentBlockBase,
  minHeight: '180px',
});

export const contentBlockFormPadding = style({
  ...contentBlockBase,
  padding: '24px',
});

export const contentBlockSidebarContent = style({
  ...contentBlockBase,
  minHeight: '200px',
});
