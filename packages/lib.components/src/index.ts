// Main library exports
// ---------------------------------------------------

// Registers the global CSS reset -- side-effect only, no exports.
import './styles/global.css';

// Export components by category
export * from './components/data-display';
export * from './components/feedback';
export * from './components/inputs';
export * from './components/layout';
export * from './components/navigation';
export * from './components/overlay';
export * from './components/utility';

// Export shared types and utilities
export * from './hooks';
export * from './types';
export * from './utils';

// Export styles
// `breakpoints` is aliased here because components/layout's responsive.ts
// utilities already export a differently-scaled `breakpoints` of their own.
export type { Theme } from './styles/theme';
export {
  darkTheme,
  lightTheme,
  breakpoints as themeBreakpoints,
} from './styles/theme';
export {
  vars,
  lightThemeClass,
  darkThemeClass,
  themeRoot,
} from './styles/theme.css';
