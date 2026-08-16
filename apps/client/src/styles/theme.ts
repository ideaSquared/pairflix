// Design tokens live in @pairflix/components (packages/lib.components/src/styles/theme.ts)
// so the client and admin apps share one contract instead of maintaining copies.
export type { Theme } from '@pairflix/components';
export {
  darkTheme,
  lightTheme,
  themeBreakpoints as breakpoints,
} from '@pairflix/components';
