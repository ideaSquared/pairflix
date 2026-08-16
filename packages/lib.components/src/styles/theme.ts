// Pairflix design tokens.
//
// `theme.css.ts` turns the `lightTheme`/`darkTheme` objects below into a
// vanilla-extract theme contract (`vars`) plus a light and a dark theme
// class. Components only ever read `vars.*` -- never these raw values.
//
// `breakpoints` stays a plain export (not part of the CSS-variable contract)
// because `@media` conditions can't reference CSS custom properties.
export const breakpoints = {
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
  xxl: '2560px',
};

const shared = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
  },
};

export type Theme = {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: {
      primary: string;
      secondary: string;
      input: string;
      card: string;
      paper: string;
      hover: string;
      highlight: string;
    };
    border: string;
    overlay: string;
    text: {
      primary: string;
      secondary: string;
      error: string;
      success: string;
      warning: string;
    };
    status: {
      toWatch: string;
      watchTogetherFocused: string;
      watchTogetherBackground: string;
      watching: string;
      finished: string;
    };
  };
  spacing: typeof shared.spacing;
  borderRadius: typeof shared.borderRadius;
  typography: typeof shared.typography;
  shadows: typeof shared.shadows;
};

export const darkTheme: Theme = {
  ...shared,
  colors: {
    primary: '#818cff',
    primaryHover: '#919dff',
    secondary: '#6b6b6b',
    background: {
      primary: '#121212',
      secondary: '#1a1a1a',
      input: '#2a2a2a',
      card: '#1a1a1a',
      paper: '#1f1f1f',
      hover: '#2a2a2a',
      highlight: '#2d2d2d',
    },
    border: '#3a3a3a',
    overlay: 'rgba(0, 0, 0, 0.6)',
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
      error: '#ff6b6b',
      success: '#4caf50',
      warning: '#ffd700',
    },
    status: {
      toWatch: '#818cff',
      watchTogetherFocused: '#a385eb',
      watchTogetherBackground: '#ff8ac5',
      watching: '#ffd700',
      finished: '#4caf50',
    },
  },
};

export const lightTheme: Theme = {
  ...shared,
  colors: {
    primary: '#4853db',
    primaryHover: '#3942b5',
    secondary: '#6b6b6b',
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      input: '#ffffff',
      card: '#ffffff',
      paper: '#ffffff',
      hover: '#f0f0f0',
      highlight: '#f5f7ff',
    },
    border: '#d0d0d0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    text: {
      primary: '#1a1a1a',
      secondary: '#595959',
      error: '#d32f2f',
      success: '#2e7d32',
      warning: '#ed6c02',
    },
    status: {
      toWatch: '#4853db',
      watchTogetherFocused: '#6c4aa6',
      watchTogetherBackground: '#d4387c',
      watching: '#ed6c02',
      finished: '#2e7d32',
    },
  },
};
