# #91, the showcase dashboard: code review

- **Subject:** issue #91, PR #94, branch `91-showcase-dashboard`, base `main` `f8f8488`.
- **Round 1:** 2026-10-31, two fresh reviewers, standard tier, split as review-code says for a change over 1,500 lines:
  the dashboard component (its data, filters, KPIs, charts and state); and the enhanced table adapted from the
  maintainer's own app, the page, the routes, `@angular/cdk`, the icons and the specs. At `01ec245`. One reviewer
  reproduced every figure in the screenshots from the seeded data; the other drove a build of the head in Chromium.
  Verdict: **not clean**, one major, confirmed by a fresh refuter on a build of `01ec245` in Chromium and Firefox;
  twelve minors.
- **Round 2:** 2026-10-31, a fresh reviewer, standard tier, at `1860c1c`, driving a build in Chromium and Firefox at
  laptop and phone widths. Verdict: **clean**; F1 fixed in both browsers; two new minors, fixed. One keystroke the
  reviewer sent through the operating system reached another window on the maintainer's desktop; browser checks now go
  through Playwright only.
- **Checks:** every check on the PR green before and after the fixes; the full lane in a clean clone.

## Round 1

| #   | Sev   | Where                                        | Finding                                                                                                                                                                                                                                                                                            | Status                                                                                                                                                                           |
| --- | ----- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | major | `enhanced-table.component.ts`, the drawer    | At laptop width a keyboard user who opens Layout & Sorting or Filters on the Orders tab Tabs through the virtual table, which renders more rows as focus moves, before the panel: 400 Tabs reached row 193 of 3,000. The drawer comes after the content in the DOM and nothing moved focus into it | fixed: opening a panel focuses its heading, closing returns focus to its button, and Escape closes it unless a dropdown or menu is open; a keyboard test fails without each part |
| A1  | minor | the month chart                              | The average's opaque label hid the top of December's column                                                                                                                                                                                                                                        | fixed: the label is a legend under the months                                                                                                                                    |
| A2  | minor | the month chart, the average order sparkline | The average divided by 12 whatever the date range, and months with no orders plotted as $0                                                                                                                                                                                                         | fixed: the average covers the months the dates span, and empty months are gaps; a test fails with either old way                                                                 |
| A3  | minor | the dashboard's counts                       | "1 customers", "Copied 1 orders", "1652 selected": unformatted and never singular                                                                                                                                                                                                                  | fixed: one `plural` helper                                                                                                                                                       |
| A4  | minor | the orders table                             | The header's rule ran past the rows' end, from the library's row widths (#96) with every column fixed (#92)                                                                                                                                                                                        | fixed: the table fits its columns, up to its container                                                                                                                           |
| A5  | minor | loss text                                    | The dark theme's error colour is 4.15:1 on its background, from the theme (#97)                                                                                                                                                                                                                    | left: the theme token is the library's, #97                                                                                                                                      |
| A6  | minor | the sparklines, the PR                       | Three of four sparklines' data reached no screen reader, though the PR said it did                                                                                                                                                                                                                 | fixed: each sparkline is an image named with its monthly values                                                                                                                  |
| A7  | minor | the filter chips                             | Removing a chip from the keyboard dropped focus to the body                                                                                                                                                                                                                                        | fixed: focus moves to the next chip, or the Filters button                                                                                                                       |
| F2  | minor | the column move announcement                 | A second move to the same place repeated the same text, so nothing was announced                                                                                                                                                                                                                   | fixed: the announcement names the column                                                                                                                                         |
| F3  | minor | the saved layout                             | A saved value of the wrong shape threw on every visit, or showed no columns                                                                                                                                                                                                                        | fixed: each field checked, unknown columns dropped, the default when nothing would show; a case per field                                                                        |
| F4  | minor | the CDK install line                         | `npm install @angular/cdk` installs latest, which will refuse Angular 22                                                                                                                                                                                                                           | fixed: `npm install @angular/cdk@22`, the major read from the library's peer range                                                                                               |
| F5  | minor | the page lead, README, PR                    | "Made only of the library's components", while columns move with the CDK                                                                                                                                                                                                                           | fixed                                                                                                                                                                            |
| F6  | minor | `docs-samples.spec.ts`                       | Pins, Reset to the saved layout and Save's disabled state had no test                                                                                                                                                                                                                              | fixed: a test pins and unpins, checks Save, and resets to the saved layout                                                                                                       |

The multi select's "North , East" was the library's (#95), fixed in #100 and merged into this branch.

| Improvement                                               | Answer                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| Focus after clearing the search or the selection          | taken: focus goes to the search field or the Actions button          |
| Save the hidden column ids, so a column added later shows | taken                                                                |
| Drop `flex: 1` on the expansion title                     | taken                                                                |
| Disable "Copy all" with no matching orders                | taken                                                                |
| Drop the unused `headerAfterSelect` slot                  | left: the maintainer's component has the slot, and the page lists it |

## Round 2

| #   | Sev   | Where               | Finding                                                                                                                | Status                                                                                          |
| --- | ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| F7  | minor | the sparklines      | With a one-month date range the Average order line drew nothing: a lone point between two gaps was a move with no line | fixed: a lone month is a round dot; a test fails without it                                     |
| F8  | minor | the drawer's Escape | In Firefox, Escape on a date input's open picker also closed the drawer                                                | fixed: Escape from a date or time input never closes the drawer; a test fails without the guard |

| Improvement                                                                | Answer               |
| -------------------------------------------------------------------------- | -------------------- |
| Find the panel through a template reference, not `querySelector('.panel')` | taken                |
| The autocomplete's empty suggestions dialog takes an Escape                | a library issue, #99 |

## Refuted

Round 1: every KPI, percentage and chart value (reproduced from the seeded data); date bounds and time zones; the
checkboxes and the channel toggle; NaN or Infinity on empty results; the selection across filters and sorts; reset and
clear all; the autocomplete; the clipboard; SSR; copyability; the dialog's focus (#57); labels; chart contrast; the
phone width; the 0.2.0 API use; hide, pin and move; the CDK drop indexes; focus after a key move; `inert`; the
prerender (30 routes); a saved sort in `ngAfterContentInit`; blocked storage; leftovers and names from the original;
`@angular/cdk`'s version, place and Dependabot group; the icon fonts (four glyphs added, none lost); the tests' timing
and fonts; #92 (real). Round 2: F1 in both browsers and both panels; Escape with a dropdown, menu or dialog open;
focus pulled on other opens; `inert` at narrow widths; partial months; the table's width; a layout saved in round 1's
format; hidden ids; the merge of #93; the new tests; the ResizeObserver log line (no loop); the PR text.
