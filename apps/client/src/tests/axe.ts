// The axe check (WCAG 2.2 AA) and its exclusion list live in lib.components so the app and the
// component library share one configuration and one place to record an exception.
export { expectNoAxeViolations } from '@pairflix/components/utils/a11y-test-utils';
