import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('*', { boxSizing: 'border-box' });

globalStyle('body', {
  margin: 0,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('input, select, textarea, button', { fontFamily: 'inherit' });

globalStyle('h1, h2, h3, h4, h5, h6', {
  color: vars.colors.text.primary,
  marginTop: 0,
});

globalStyle('a', {
  color: vars.colors.primary,
  textDecoration: 'none',
});

globalStyle('a:hover', {
  color: vars.colors.primaryHover,
});
