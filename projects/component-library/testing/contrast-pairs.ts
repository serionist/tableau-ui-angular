// What the specs and the docs site share; never published, since no entry point imports it.

/** A colour of the theme's on a background in another, where the library draws it: text, an icon, a border or a ring */
export interface ContrastPair {
  readonly text: string;
  readonly background: string;
  readonly where: string;
}

/**
 * Each pair of theme colours the library draws error text, an error button's label, or the primary as text, an icon,
 * a border, a ring or a button's label in. Each reads at 4.5:1 or more in both themes, where WCAG asks 3:1 of a border
 * or a ring: the theme's contrast spec reads every pair, and the theming page lists them.
 */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: '--twc-color-error', background: '--twc-color-base', where: "Error text on the page, a dialog's body or an input; a stroked error button's label" },
  { text: '--twc-color-error', background: '--twc-color-primary-light', where: "Error text on a table's selected row" },
  { text: '--twc-color-error', background: '--twc-color-highlight', where: 'Error text on the keyboard highlight in a list, a select, an autocomplete or a menu' },
  { text: '--twc-color-error', background: '--twc-modal-color-header', where: "Error text on a modal's header" },
  { text: '--twc-color-error', background: '--twc-color-mouse-highlight', where: "A stroked error button's label under the pointer" },
  { text: '--twc-color-base', background: '--twc-color-error', where: "A raised error button's label" },
  { text: '--twc-color-base', background: '--twc-color-error-dark', where: "A raised error button's label under the pointer" },
  {
    text: '--twc-color-primary-on-base',
    background: '--twc-color-base',
    where:
      "Primary text and icons on the page, a dialog or a menu; a stroked primary button's label and border; a checkbox's and a radio button's focus ring, a selected option's outline, a column's resize line",
  },
  { text: '--twc-color-primary-on-base', background: '--twc-color-mouse-highlight', where: "A stroked primary button's label and border under the pointer" },
  { text: '--twc-color-primary-on-base', background: '--twc-color-highlight', where: "A primary menu item on the highlight; a selected option's outline on the keyboard highlight" },
  { text: '--twc-color-primary-on-base', background: '--twc-color-primary-light', where: "An info snack's icon, border and timer; a primary icon on a table's selected row" },
  { text: '--twc-color-on-primary', background: '--twc-color-primary', where: "A raised primary button's label; a checked button toggle option's label" },
  { text: '--twc-color-base', background: '--twc-color-primary-dark', where: "A raised primary button's label under the pointer" },
];
