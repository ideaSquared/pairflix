/**
 * The one place an axe rule may be switched off, and only for one named component or page --
 * never globally. Every entry needs a comment saying why it cannot be fixed yet; remove the
 * entry in the change that fixes it. A test opts in by passing the same `component` name to
 * `expectNoAxeViolations`, so an entry has no effect anywhere else.
 */
export type AxeExclusion = {
  /** axe rule id, e.g. 'nested-interactive'. */
  rule: string;
  /** The component or page name the test passes to `expectNoAxeViolations`. */
  component: string;
};

export const AXE_EXCLUSIONS: readonly AxeExclusion[] = [
  // DataTable's selectable rows put role="checkbox" on the <tr> itself, so any row action
  // button is an interactive control nested inside another. The fix is a real selection
  // checkbox in its own cell, which changes the table's selection API; nothing uses
  // `selectable` today, so it is left for the change that first needs selectable rows.
  { rule: 'nested-interactive', component: 'DataTable (selectable)' },
];

/** axe `rules` options that switch off the exclusions for one component, and nothing else. */
export const axeRulesDisabledFor = (
  component: string | undefined
): Record<string, { enabled: false }> =>
  Object.fromEntries(
    AXE_EXCLUSIONS.filter(exclusion => exclusion.component === component).map(
      exclusion => [exclusion.rule, { enabled: false }]
    )
  );
