import { createTheme, createThemeContract, style } from '@vanilla-extract/css';
import { darkTheme, lightTheme } from './theme';

/** The CSS-variable contract every component reads from. */
export const vars = createThemeContract({
  colors: {
    primary: null,
    primaryHover: null,
    secondary: null,
    background: {
      primary: null,
      secondary: null,
      input: null,
      card: null,
      paper: null,
      hover: null,
      highlight: null,
    },
    border: null,
    overlay: null,
    text: {
      primary: null,
      secondary: null,
      error: null,
      success: null,
      warning: null,
    },
    status: {
      toWatch: null,
      watchTogetherFocused: null,
      watchTogetherBackground: null,
      watching: null,
      finished: null,
    },
  },
  spacing: { xs: null, sm: null, md: null, lg: null, xl: null },
  borderRadius: { sm: null, md: null, lg: null },
  typography: {
    fontFamily: null,
    fontSize: { xs: null, sm: null, md: null, lg: null, xl: null },
    fontWeight: { normal: null, medium: null, bold: null },
  },
  shadows: { sm: null, md: null, lg: null, xl: null },
});

export const lightThemeClass = createTheme(vars, lightTheme);
export const darkThemeClass = createTheme(vars, darkTheme);

/**
 * Applied alongside a theme class on the ThemeProvider root so the page paints the
 * theme background. `body` itself can't read `vars.*` (it's an ancestor of this
 * element, not a descendant, so the custom properties aren't in scope there) --
 * this element is what actually fills the viewport and carries the theme.
 */
export const themeRoot = style({
  minHeight: '100vh',
  backgroundColor: vars.colors.background.primary,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily,
  transition: 'background-color 0.3s ease, color 0.3s ease',
});
