# S7d, the table group's fixes: code review

- **Subject:** S7d of #24, PR #69, branch `24-s7d-table`, base `main` `f2ed76a`.
- **Round 1:** 2026-10-29, two fresh reviewers, split as review-code says for a change over 1,500 lines: the data
  loading (the virtualize base, the data manager, the table's load and reset), and the table's UI, the list, SSR, the
  demo, the docs and the coverage floor. Standard tier, at `d0c257a`. Verdict: **needs-fixes**, one major.
- **Round 2:** 2026-10-29, a fresh reviewer on the fixes `d0c257a..cfc9871`. Verdict: **clean**; every round 1 fix holds; three minors and one improvement, fixed in
  the same round.
- **Checks:** every check on the PR green after each round; the full lane locally, with the component tests in
  Chromium and Firefox, 20 prerendered routes and the coverage floor at 75%.

The major went to no separate refuter: its fix began with a spec that reproduced it on the code under review, where
requests piled up until the browser ran out of memory.

## Round 1

| #   | Sev   | Where                                 | Finding                                                                                                                                                                                                                                                                           | Status                                                                                                                                                                           |
| --- | ----- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | major | the virtualize base, the data manager | An app's effect that called `reset()`, `reload()` or `load()` looped: their synchronous part read and wrote signals inside the app's effect, so it ran again, reset again and sent another request, without end; it also tracked the selection options, undoing F102 for that app | fixed: the public methods run their synchronous part untracked, and the data manager reads its own signals untracked; the spec asserts one request per change                    |
| m2  | minor | `data-manager.ts`                     | Each full-mode block left an abort listener on the full load, so scrolling a large table piled them up                                                                                                                                                                            | fixed: the listener is tied to the block's own signal; the replaced full load is cancelled after the new state is set                                                            |
| m3  | minor | the virtualize base                   | The row height was measured only when `dataRowCss` changed, so after a font-size change `reload()` kept the old height                                                                                                                                                            | fixed: `reload()` re-measures, in the browser only                                                                                                                               |
| m4  | minor | `testing/people.ts`, the plan         | A zone wrapper in the fake server did nothing, since the specs run zoneless, and its comment and two plan rows described zone behaviour                                                                                                                                           | fixed: the wrapper is gone and the rows corrected; AGENTS.md gains a trap: a worktree inside the main checkout can resolve zone.js from the main checkout's older `node_modules` |
| m5  | minor | `virtualize.component.ts`             | `dataWindowHeightPx`'s doc didn't say it is read only at load and reload                                                                                                                                                                                                          | fixed                                                                                                                                                                            |
| m6  | minor | the table spec                        | Nothing pinned that `reset(true)` loads once                                                                                                                                                                                                                                      | fixed                                                                                                                                                                            |
| A   | minor | `table.component.ts`                  | A click on the library's own button toggle, or another ARIA widget, in a cell also changed the row selection                                                                                                                                                                      | fixed: those count as a cell's own controls                                                                                                                                      |
| B   | minor | the list                              | A disabled list was marked touched after a click, so a required one showed its error the moment it was enabled                                                                                                                                                                    | fixed: a disabled list is never touched, and its options take no pointer                                                                                                         |
| C   | minor | the table's line clamp                | A `lineHeight` of `normal` gave the clamp box a height of 0 and blanked every clamped cell                                                                                                                                                                                        | fixed: the height binding is gone; the line clamp itself clamps                                                                                                                  |

| Improvement                                                       | Answer     |
| ----------------------------------------------------------------- | ---------- |
| Cancel the old full load after its replacement is set             | taken      |
| The reset warning names a hidden host and says to call `reload()` | taken      |
| Mark F101, F105, F115 and F116 open with their reason             | taken      |
| Note on #68 that the table has the same gap                       | taken      |
| The virtualize demo loads once                                    | taken      |
| A failed full load reports its failure five times                 | later: #70 |
| Vertical padding in `dataRowCss` puts the spacers out of step     | later: #71 |

## Round 2

| #   | Sev   | Where                          | Finding                                                                                                                                                                                       | Status                                                                                        |
| --- | ----- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| N1  | minor | `list.component.scss`          | A regression from B: stopping the pointer on a disabled list's options also stopped scrolling it, so a long disabled multi-select could not be scrolled to see its options or what was picked | fixed: the rule is gone, and a disabled list can't take focus another way                     |
| N2  | minor | the list spec                  | The disabled-list test failed only when both halves of B were removed                                                                                                                         | fixed: one test per half                                                                      |
| N3  | minor | the table and virtualize specs | Only `reset()` from an app's effect was pinned; `reload()` from one could lose its `untracked` unnoticed                                                                                      | fixed: a spec calls `reload()` from an app effect and expects one request after a sort change |

| Improvement                                                                                | Answer |
| ------------------------------------------------------------------------------------------ | ------ |
| The line clamp warns on every `reload()` for a non-pixel line height, which it now handles | taken  |

## Refuted

Round 1: the input check missing a real change (signal equality and new arrays); a late answer from an overtaken
request (the generation checks); a component destroyed with requests in flight; an overtaken reset ending the loading
state; a cancelled full load logging; an empty result; the effect reading the plain `loaded` field; aborting before
the new state is set (fine inside a zone task); public API (only protected members moved, and the base is new in
0.2.0); SSR; clicks on cell controls selecting the row; ctrl and shift clicks; keyboard selection (rows aren't
focusable); placeholder rows; F94 and the selection column; the header checkbox as a `computed`; the Breaking lines;
the listbox against the APG and the select; touched on a window blur; the demo's `afterNextRender`; the 20 routes; the
axe rules turned off (each belongs to its issue); every test failing without its fix; the docs' marks.

Round 2: `untracked` dropping a needed dependency (the table's own effect tracks its inputs); `reset()` still awaitable;
the re-measure counter looping or running on the server; a read-only textbox cell swallowing a row click; a click
between a toggle's options; a synchronously throwing data source; an app effect reading its own selection; the
CHANGELOG's M1 line (accurate against the release); a tab group in a cell; the AGENTS.md trap (true, 138 lines).
