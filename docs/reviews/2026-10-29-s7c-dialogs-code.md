# S7c, the dialogs area's fixes: code review

- **Subject:** S7c of #24, PR #63, branch `24-s7c-dialogs`, base `main` `bd902f7`.
- **Round 1:** 2026-10-29, two fresh reviewers, split as review-code says for a change over 1,500 lines: the dialog,
  snack, button toggle and tab group; and the nav bar, menu button, expansion panel, tree, the stepper's removal, the
  demo pages, the prerender routes, the coverage floor and the docs. Standard tier, at `ef65780`. Verdict: **clean**,
  no blocker or major; four minors, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes; the full lane locally, with the component tests
  in Chromium and Firefox and 18 prerendered routes.

## Round 1

| #   | Sev   | Where                           | Finding                                                                                                                                                                                            | Status                                                                                                                                                                                          |
| --- | ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | minor | `nav-bar-button.component.scss` | A collapsed button's hidden text had no positioned ancestor, so the lower buttons' text lengthened the page: a full-height shell with more buttons than fit got a window scrollbar and blank space | fixed: the button is positioned, and the hidden text takes the standard 1px box                                                                                                                 |
| A1  | minor | `styles/_snack.service.scss`    | The snack's button reset reached every button in a snack, so an app's buttons in a component snack lost their look, the close lost its hover, and Undo took the browser's font size                | fixed: the reset moved into the snack component's own styles, for its own two buttons; the new test can only guard the scoping, since specs don't load the global stylesheet where the leak was |
| A2  | minor | `button-toggle.component.ts`    | A disabled toggle, focused by a click, still changed its bound value on the arrow keys                                                                                                             | fixed: keys do nothing while disabled                                                                                                                                                           |
| A3  | minor | `dialog.service.ts`             | On the server, a guard or resolver awaiting a confirmation dialog never finished, and held the render                                                                                              | fixed: on the server the confirmation helpers resolve `false` at once                                                                                                                           |

| Improvement                                                                                                                   | Answer |
| ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| The expansion panel's and nav bar's toggles keep one name, the panel's from its title, with `aria-expanded` telling the state | taken  |
| `aria-current="page"` on the active nav bar button                                                                            | taken  |
| Drop the nav bar module's unused imports                                                                                      | taken  |
| `DialogService.ngOnDestroy` closes every open dialog                                                                          | taken  |
| The snack's focus test checks focus is restored                                                                               | taken  |

## Refuted

Stepper leftovers (none outside the changelog, plan and review); the nav bar's `(click)` firing twice or when
disabled; routerLink navigation and active styling; the linkless button by keyboard; the nav button's `<button>`
matching the library's button; a circular import; `(click)` on the menu button going silent (a Breaking line says so);
I9 needing a Breaking line (a form control on a tree node already threw); the tree on the server; the 18 routes
touching browser globals; the coverage floor; the docs markings; D6 (an output rename and a removed entry point aren't
names it covers); a server dialog ref leaking or blocking (only awaiting it in a navigation did, A3); hydration (dialogs
and snacks sit outside the app root); the live region's announcement; `ngAfterContentChecked` looping; content hooks
missing nested changes; a tooltip orphaned by Escape; one Escape closing two dialogs; the stack's z-indexes; the
button toggle's forms contract (it has none); the snack countdown's edges; every test failing without its fix.
