# A3, chips, the expansion panel and the drawer (#55, #75, #79, #59): code review

- **Subject:** step A3 of `docs/plans/2026-11-01-accessibility.md`, issues #55, #75, #79 and #59 under #101, PR #112,
  branch `55-chips-panel-drawer`, base `main` `1c85ad0`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the accessibility, overlays and public API lenses in
  depth, at `7f5fb58`. It read the chip's and the panel's names natively in Chromium's accessibility tree and Firefox's
  UI Automation tree, from a static copy of their markup, with no input sent. Verdict: **clean**, no blocker or major;
  four minors, fixed.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                                | Finding                                                                                                                                                                                                              | Status                                                                                                       |
| --- | ----- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| F1  | minor | the chip control's region            | It had no `aria-atomic`, so a highlight moving between chips whose text shares its ends could be read as nothing                                                                                                     | fixed, with a spec of the attribute                                                                          |
| F2  | minor | `chipWords()`                        | A chip that shows only an image with `alt` gave no words, while its remove button was named from the alt                                                                                                             | fixed: an element's `aria-label`, then an image's `alt`; a spec with an image-only chip                      |
| F3  | minor | CHANGELOG, the drawer page and JSDoc | Two changes apps see weren't named: the chip's content moved into a `span`, and focus set into a drawer in the same tick it opens fails while it's still inert; and "the page's first render" meant the drawer's own | fixed: two Breaking lines with how to move over; "once it renders, in `afterNextRender`"; "its first render" |
| F4  | minor | `drawer-container.component.spec.ts` | Two focus rules weren't pinned: no opener for a drawer open from its first render, and leaving focus where the app moves it in its own `afterNextRender`                                                             | fixed, with a spec each                                                                                      |
| -   | minor | the plan                             | The step's calls and progress weren't in the plan                                                                                                                                                                    | fixed: its calls as rows, a note on the remove name's departure, a progress line                             |

| Improvement                                         | Answer                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Pin #79 by part of a name                           | taken, with a regular expression, since the test library's non-exact match is of the whole name |
| The chip's place in the sentence, "Berlin, 2 of 3"  | taken                                                                                           |
| `aria-atomic` on the dashboard's column-move region | taken                                                                                           |

## Refuted

The remove button's name through its icon working only in some browsers (both engines give "Remove Berlin"); the
specs' role queries not checking each browser's own name (the native trees match); the `display: contents` span
dropping out of the name; the region announcing on load or repeating; stale words after a removal; focus jumping while
a drawer slides closed; the effect running after `inert`; a drawer inside a modal; server rendering; the dashboard;
the API file beyond `$label`; two drawers whose opener sits in the other.
