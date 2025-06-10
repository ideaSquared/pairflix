// Standardized breakpoints for the PairFlix design system
export const breakpoints = {
  xs: '375px', // Small mobile
  sm: '576px', // Mobile
  md: '768px', // Tablet
  lg: '992px', // Small desktop
  xl: '1200px', // Desktop
  xxl: '1600px', // Large desktop
} as const;

export type BreakpointKey = keyof typeof breakpoints;

// Media query helpers for better readability
export const media = {
  mobile: `(max-width: ${breakpoints.sm})`,
  tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  largeDesktop: `(min-width: ${breakpoints.xxl})`,

  // More granular breakpoint queries
  xs: `(max-width: ${breakpoints.xs})`,
  sm: `(max-width: ${breakpoints.sm})`,
  md: `(max-width: ${breakpoints.md})`,
  lg: `(max-width: ${breakpoints.lg})`,
  xl: `(max-width: ${breakpoints.xl})`,
  xxl: `(max-width: ${breakpoints.xxl})`,

  // Min-width queries
  smUp: `(min-width: ${breakpoints.sm})`,
  mdUp: `(min-width: ${breakpoints.md})`,
  lgUp: `(min-width: ${breakpoints.lg})`,
  xlUp: `(min-width: ${breakpoints.xl})`,
  xxlUp: `(min-width: ${breakpoints.xxl})`,

  // Between breakpoints
  smToMd: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  mdToLg: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  lgToXl: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
} as const;

// Layout tokens for consistent spacing and sizing
export const layoutTokens = {
  sidebar: {
    width: '250px',
    collapsedWidth: '60px',
    zIndex: 100,
  },
  header: {
    height: '64px',
    zIndex: 200,
  },
  navigation: {
    zIndex: 150,
  },
  modal: {
    zIndex: 1000,
  },
  tooltip: {
    zIndex: 1100,
  },
  content: {
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
    },
    maxWidth: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1600px',
    },
  },
} as const;

// Responsive value type for props that can vary by breakpoint
export type ResponsiveValue<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      xxl?: T;
    };

// Helper to create responsive CSS from responsive values
export const createResponsiveCSS = <T>(
  value: ResponsiveValue<T>,
  cssProperty: string,
  transform?: (val: T) => string
): string => {
  if (typeof value === 'object' && value !== null) {
    let css = '';

    // Add base styles (largest breakpoint first for mobile-first approach)
    const breakpointKeys = Object.keys(value) as BreakpointKey[];
    const sortedKeys = breakpointKeys.sort((a, b) => {
      const order = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
      return order.indexOf(a) - order.indexOf(b);
    });

    sortedKeys.forEach(breakpoint => {
      const val = (value as any)[breakpoint];
      if (val !== undefined) {
        const cssValue = transform ? transform(val) : val;

        if (breakpoint === 'xs') {
          css += `@media ${media.xs} { ${cssProperty}: ${cssValue}; }`;
        } else if (breakpoint === 'sm') {
          css += `@media ${media.sm} { ${cssProperty}: ${cssValue}; }`;
        } else if (breakpoint === 'md') {
          css += `@media ${media.md} { ${cssProperty}: ${cssValue}; }`;
        } else if (breakpoint === 'lg') {
          css += `@media ${media.lg} { ${cssProperty}: ${cssValue}; }`;
        } else if (breakpoint === 'xl') {
          css += `@media ${media.xl} { ${cssProperty}: ${cssValue}; }`;
        } else if (breakpoint === 'xxl') {
          css += `@media ${media.xxl} { ${cssProperty}: ${cssValue}; }`;
        }
      }
    });

    return css;
  } else {
    const cssValue = transform ? transform(value as T) : value;
    return `${cssProperty}: ${cssValue};`;
  }
};

// Spacing utilities that work with the theme system
export type SpacingValue = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';

// Helper to get spacing value from theme
export const getSpacing = (value: SpacingValue, theme: any): string => {
  if (value === 'none') return '0';
  return theme.spacing?.[value] || '1rem';
};

// Grid utilities
export interface GridConfig {
  columns?: number | string;
  rows?: number | string;
  gap?: SpacingValue;
  columnGap?: SpacingValue;
  rowGap?: SpacingValue;
  areas?: string[];
}

// Flex utilities
export interface FlexConfig {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around';
  gap?: SpacingValue;
}

// Container utilities
export interface ContainerConfig {
  maxWidth?: BreakpointKey | 'full';
  padding?: SpacingValue;
  margin?: SpacingValue;
  centered?: boolean;
}

// Helper functions for common responsive patterns
export const mobileFirst = (
  styles: Partial<Record<BreakpointKey, string>>
): string => {
  const breakpointOrder: BreakpointKey[] = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'xxl',
  ];

  return breakpointOrder
    .filter(bp => styles[bp])
    .map(
      bp => `@media ${media[`${bp}Up` as keyof typeof media]} { ${styles[bp]} }`
    )
    .join('\n');
};

export const desktopFirst = (
  styles: Partial<Record<BreakpointKey, string>>
): string => {
  const breakpointOrder: BreakpointKey[] = [
    'xxl',
    'xl',
    'lg',
    'md',
    'sm',
    'xs',
  ];

  return breakpointOrder
    .filter(bp => styles[bp])
    .map(bp => `@media ${media[bp]} { ${styles[bp]} }`)
    .join('\n');
};

// Common responsive patterns
export const hideOnMobile = `
  @media ${media.mobile} {
    display: none;
  }
`;

export const hideOnDesktop = `
  @media ${media.desktop} {
    display: none;
  }
`;

export const showOnlyMobile = `
  display: none;
  @media ${media.mobile} {
    display: block;
  }
`;

export const showOnlyDesktop = `
  display: none;
  @media ${media.desktop} {
    display: block;
  }
`;

// Helper to create container queries (for modern browsers)
export const createContainerQuery = (size: string, styles: string): string => {
  return `@container (min-width: ${size}) { ${styles} }`;
};

// Utility for responsive font sizes
export const responsiveFontSize = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  let css = `font-size: ${mobile};`;

  if (tablet) {
    css += `@media ${media.tablet} { font-size: ${tablet}; }`;
  }

  if (desktop) {
    css += `@media ${media.desktop} { font-size: ${desktop}; }`;
  }

  return css;
};

// Utility for responsive spacing
export const responsiveSpacing =
  (
    property: 'margin' | 'padding',
    mobile: SpacingValue,
    tablet?: SpacingValue,
    desktop?: SpacingValue
  ) =>
  (theme: any): string => {
    let css = `${property}: ${getSpacing(mobile, theme)};`;

    if (tablet) {
      css += `@media ${media.tablet} { ${property}: ${getSpacing(tablet, theme)}; }`;
    }

    if (desktop) {
      css += `@media ${media.desktop} { ${property}: ${getSpacing(desktop, theme)}; }`;
    }

    return css;
  };

// Export everything for easy importing
export default {
  breakpoints,
  media,
  layoutTokens,
  createResponsiveCSS,
  getSpacing,
  mobileFirst,
  desktopFirst,
  hideOnMobile,
  hideOnDesktop,
  showOnlyMobile,
  showOnlyDesktop,
  createContainerQuery,
  responsiveFontSize,
  responsiveSpacing,
};
