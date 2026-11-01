# A8, column resizing (#67): code review

- **Subject:** step A8 of `docs/plans/2026-11-01-accessibility.md`, issue #67 under #101, PR #127, branch
  `67-column-resize`, base `main` `4fb3cae`, with `main` merged in after #123.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the accessibility, overlays-and-dom and public API
  lenses in depth, at `9ee5fbf`, by reading and with Playwright scripts that read Chromium's accessibility tree and ran a
  real touch drag on a copy of the resizer. Verdict: **clean**, no blocker or major; five minors, four fixed at `39529ba` and one left to #128. The
  first minor's fix departed from the proposed one; read in the session: the observer that finds untitled headers
  settles after its own change, since the place text isn't counted and the set is written only when it differs.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                                       | Finding                                                                                                                                                                                   | Status                                                                                                                                                                                                                                                                                                                      |
| --- | ----- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | the column header's and the resizer's names | A column with no header text was named by its resizer's value, "120 pixels", and its resizer just "Resize", where on `main` the header's name was empty                                   | fixed at `39529ba`: once the browser finds a header's text has no words, the text shows its place, hidden, "Column 3", which names the header, its button and its resizer, "Resize Column 3"; an `aria-label` alone couldn't name the resizer, whose label always holds "Resize"; the page says a header needs words; specs |
| F2  | minor | the resizer's `tabindex`                    | Before the first measure, as on a prerendered page until the app boots, each resizer was a focusable separator with no value, which axe flags                                             | fixed: a resizer takes its Tab stop only once measured, and the server renders it without                                                                                                                                                                                                                                   |
| F3  | minor | `measure()`                                 | A `maxWidth` or `minWidth` changed at runtime, or a percentage bound whose basis grew, left the read bounds stale until the column changed size                                           | fixed: it measures again on focus and when its header row changes size; specs                                                                                                                                                                                                                                               |
| F4  | minor | CHANGELOG, the plan's Compatibility row     | A Tab stop per resizable column, focus on a press, and pointer events in place of mouse events were under Fixed, where apps' tests notice them                                            | fixed: a Breaking line with how to move over, `[resizable]="false"` among it; the plan's row and a decided row say so                                                                                                                                                                                                       |
| F5  | minor | the 8px edge                                | No single-pointer way to resize (WCAG 2.2's 2.5.7, which the keys don't meet) and a target under 24px with the sort button 0.5em away (2.5.8); old, not made worse here, outside the plan | later: #128                                                                                                                                                                                                                                                                                                                 |

| Improvement                                                                                                                | Answer                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| CHANGELOG's line on the header's name describes a state that never shipped: from 0.2.0 it only loses the multi-sort number | taken                                                                                               |
| A real touch drag spec through the browser's protocol, in Chromium                                                         | taken: a drag past the edge through `cdp()`, skipped in Firefox, where the synthetic spec covers it |
| The PR body's "a hidden table keeps the last values": until it shows again                                                 | taken                                                                                               |

## Refuted

`ResizerDirective` exported (it isn't; the API file only loses `onMouseDown`); `aria-valuenow` outside its bounds;
the hidden table's values; ids when columns are added, removed or reordered; the sort button's name; a throwing
`setPointerCapture()` hiding a real failure (a trusted press can't throw; a real touch drag was captured); the mouse
drag test being vacuous; a drag ending on a sort button sorting; Right in a right-to-left page (no RTL support);
VoiceOver on iOS swiping on a separator; `flex-shrink: 0` on resized columns; the focus ring's z-index; the hidden
"Resize" text; keys and drags taking the same path; server rendering and leaks; the coverage floor; plan or review
ids outside the plan.
