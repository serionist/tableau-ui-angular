// What the specs and the docs site share; never published, since no entry point imports it.

/** Text in one of the theme's colours on a background in another, where the library draws it */
export interface ContrastPair {
  readonly text: string;
  readonly background: string;
  readonly where: string;
}

/**
 * Each pair of theme colours the library draws error text or an error button's label in. Each reads at 4.5:1 or
 * more in both themes: the theme's contrast spec reads every pair, and the theming page lists them.
 */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: '--twc-color-error', background: '--twc-color-base', where: "Error text on the page, a dialog's body or an input; a stroked error button's label" },
  { text: '--twc-color-error', background: '--twc-color-primary-light', where: "Error text on a table's selected row" },
  { text: '--twc-color-error', background: '--twc-color-highlight', where: 'Error text on the keyboard highlight in a list, a select, an autocomplete or a menu' },
  { text: '--twc-color-error', background: '--twc-modal-color-header', where: "Error text on a modal's header" },
  { text: '--twc-color-error', background: '--twc-color-mouse-highlight', where: "A stroked error button's label under the pointer" },
  { text: '--twc-color-base', background: '--twc-color-error', where: "A raised error button's label" },
  { text: '--twc-color-base', background: '--twc-color-error-dark', where: "A raised error button's label under the pointer" },
];
