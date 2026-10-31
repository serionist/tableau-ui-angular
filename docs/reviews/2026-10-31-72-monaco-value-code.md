# #72, the Monaco editor's valueChange: code review

- **Subject:** issue #72, PR #87, branch `72-monaco-value`, base `main` `e893755`.
- **Round 1:** 2026-10-31, a fresh reviewer, deep tier for the public API change and standard for the rest, at
  `3aa9bc2`, read only, with CI's full lane green in Chromium and Firefox on that head. Verdict: **clean**, no blocker
  or major; two minors on the plan and the PR text, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes; the full lane in a clean clone on `3aa9bc2`.

## Round 1

| #   | Sev   | Where                                             | Finding                                                                                                             | Status                                                               |
| --- | ----- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | minor | the plan's progress line, the PR's Review section | Both said no review round runs here, which this record contradicts                                                  | fixed: both name this round                                          |
| 2   | minor | the plan, against `main`                          | `main` moved on with the MIT change, whose plan rows conflicted with this branch's, so the squash-merge was blocked | fixed: `main` merged in, its rows and progress line before this PR's |

| Improvement                                                                                                   | Answer                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Record the maintainer's agreement on #72, or link to it                                                       | answered: the maintainer agreed in the session on 2026-10-31, and the plan's progress line records it; the API's one-way doors bind from 0.2.0 |
| The Monaco page's `[(value)]` row says `(valueChange)` emits the user's edits only, as the checkbox page does | taken; the plan row that kept the page as it was is changed                                                                                    |

## Refuted

A double emit (one path; an options rebuild disposes the old listener first); a form's write coming back as an edit
(the write flag); the user's text wiped when the parent binds the same value (equal strings never recompute the linked
signal); `writeValue` before the input's first value (Angular records the source before it sets); the undo history on
a `[(value)]` round trip (equal text is left alone, and a test pins it); a race between the bound value and typing (as
on `main`); a write before load or a recreated editor; a disabled editor; two editors on one URI (as on `main`, and the
page asks for one URI each); emits after destroy; server rendering; a same-text edit emitting (it is the user's edit,
and `onChange` fired for it before); the emit order (before `onChange`, as the checkbox); the API file (only the
intended members, the other inputs reprinted with the same types); the Breaking line; the tests (three fail on `main`'s
code, the fourth on breaks of the fix, none font or timing dependent); the docs site (no page reads the editor's
`(valueChange)` or `$value`); plan ids in the PR body (the repo's convention); attribution.
