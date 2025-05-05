import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #121212;
    color: white;
    line-height: 1.5;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    color: white;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 0.5rem;
    width: 100%;
    &:focus {
      outline: none;
      border-color: #646cff;
    }
  }

  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
  }

  a {
    color: #646cff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
