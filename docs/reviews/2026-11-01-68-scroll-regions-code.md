# A7a, the table's and the virtual scroller's scroll regions (#68, #115): code review

- **Subject:** step A7a of `docs/plans/2026-11-01-accessibility.md`, issues #68 and #115 under #101, PR #116, branch
  `68-scroll-regions`, base `main` `de955b9`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the accessibility, overlays and public API lenses in
  depth, at `599005a`. It rendered a copy of the components' markup with the branch's and `main`'s compiled styles in
  Chromium and Firefox through Playwright, and measured the focus ring and the bars. Verdict: **clean**, no blocker or
  major; four minors, fixed.
- **Checks:** every check on the PR green before and after the fixes. While building a spec, a bug that predates the PR
  showed: a failed first block turns into "No data available" on the first scroll, now #119.

## Round 1

| #   | Sev   | Where                                         | Finding                                                                                                                                              | Status                                                                                                                                                              |
| --- | ----- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | `table.component.scss`, the host's focus ring | The outline painted under the table's sticky header, its rows and its pinned cells: the top edge never showed, nor the left one with a pinned column | fixed: a 2px host border, transparent until `:focus-visible`; a spec reads all four edges in both themes; the virtual scroller keeps its outline, which shows whole |
| F2  | minor | the hosts' `aria-label`                       | An app's static `aria-label` with no static `role` was removed on the first change detection, leaving a list or region unnamed                       | fixed: the app's static name is used when `label` has no words; a test per host                                                                                     |
| F3  | minor | CHANGELOG, the pages, the JSDoc               | Nothing said how an app takes the new Tab stop out                                                                                                   | fixed: a static `tabindex="-1"` on the host, with a spec                                                                                                            |
| F4  | minor | the table samples                             | Two regions on one page were both named "People"                                                                                                     | fixed                                                                                                                                                               |

| Improvement                                                       | Answer                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Pinned cells above the rows' bars when the table scrolls sideways | taken                                                                                                                        |
| One component in `testing/` that loads the library's styles       | left: ESLint refuses a component without a selector or encapsulation outside a spec file, and the repo takes no new disables |
| One helper in `testing/` for the rejection checks                 | taken                                                                                                                        |

## Refuted

The region and its table named the same; a focusable host with no role or name without `label`; "Failed to load" read
in every cell (a decided call: table navigation reads one cell at a time); the hidden text adding to the page's height
(its bar is positioned); 3:1 on every row background in both themes; `aria-setsize` after scrolling and loading; one
Tab stop added, not more; the cell tooltip showing the hidden text; the API file; the axe exceptions only shrinking;
vacuous tests; server rendering and the switch from region to list.
