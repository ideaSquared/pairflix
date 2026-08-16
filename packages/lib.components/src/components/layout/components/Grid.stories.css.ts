import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

// Local SectionTitle helper (defined in Grid.stories.tsx). `heading`/
// `headingLg` are the fontSize-16 sub-headings (differing only in the top
// margin before them); `subheading` is the smaller fontSize-14 gray label
// used above each alignItems/justifyContent demo row.
export const sectionTitle = recipe({
  base: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 500,
  },
  variants: {
    variant: {
      default: {},
      heading: { fontSize: 16, marginTop: '24px' },
      headingLg: { fontSize: 16, marginTop: '32px' },
      subheading: { fontSize: 14, marginTop: '16px', color: '#666' },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// Local SectionDescription helper (defined in Grid.stories.tsx).
const sectionDescriptionBase = {
  margin: '0 0 16px 0',
  color: '#666',
  fontSize: 14,
} as const;

export const sectionDescription = style(sectionDescriptionBase);

export const sectionDescriptionSpaced = style({
  ...sectionDescriptionBase,
  marginTop: '24px',
});

// Fixed-height bordered demo frame for the alignItems rows in
// AlignmentOptions -- gives the "start"/"center"/"end"/"stretch" comparison
// something visibly taller than its items to align within.
export const gridDemoBordered = style({
  height: '150px',
  border: '1px dashed #ccc',
});

// Dashboard Layout demo (UIPatterns) -- gives the content column a minimum
// height so it visually matches the sidebar next to it.
export const gridDashboardWrapper = style({
  minHeight: '400px',
});

// Stat-cards row within the Dashboard Layout demo.
export const gridStatCardsWrapper = style({
  marginBottom: '16px',
});

// Dev-only viewport indicator for the stories below -- not part of the
// component itself, purely a Storybook documentation aid.
export const responsiveIndicator = style({
  position: 'fixed',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '4px 8px',
  fontSize: '12px',
  borderRadius: '4px',
  zIndex: 1000,
  '@media': {
    '(max-width: 480px)': {
      backgroundColor: '#f44336',
      selectors: {
        '&::after': { content: '"Mobile View"' },
      },
    },
    '(min-width: 481px) and (max-width: 768px)': {
      backgroundColor: '#ff9800',
      selectors: {
        '&::after': { content: '"Tablet View"' },
      },
    },
    '(min-width: 769px) and (max-width: 1024px)': {
      backgroundColor: '#4caf50',
      selectors: {
        '&::after': { content: '"Desktop View"' },
      },
    },
    '(min-width: 1025px)': {
      backgroundColor: '#2196f3',
      selectors: {
        '&::after': { content: '"Large Desktop View"' },
      },
    },
  },
});
