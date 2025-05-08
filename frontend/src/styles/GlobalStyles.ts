import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.input};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.sm};
    padding: ${theme.spacing.sm};
    width: 100%;
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  /* Accessibility */
  :focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  /* Remove default focus outline for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Improve text rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;
