# #119, a failed first block turning into "No data available" on scroll: code review

- **Subject:** issue #119 under #101, PR #120, branch `119-failed-first-block`, base `main` `e33b32c`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the change-detection-and-signals lens and the data
  loading paths in depth, at `2889416`, by reading: as the maintainer set for this release, heavy test runs wait for
  #101's final pass, and CI ran the full lane on the head. Verdict: **clean**, no finding.
- **Checks:** every check on the PR green at `2889416`; the branch then took `main` in at `3fb3403`, a CHANGELOG
  conflict only.

## Round 1

No blocker, major or minor.

| Improvement                                                                                                                                                                          | Answer                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| A table spec for the issue's own scenario, a sideways scroll after a failed first block                                                                                              | left: the virtual scroller's spec drives the same data manager, and the table's sideways scroll calls the same `setScrollPosition` |
| The CHANGELOG line also names `dataBlockWindow` and `dataRowCss`, which load the list again too                                                                                      | taken                                                                                                                              |
| The PR's second decided call: before the first reset, or after a reset whose window holds no row, `main` didn't draw "the same empty list" on a scrolled host but looped without end | taken: the call says the fix also stops that loop, `Math.floor(topPx / 0)` giving `Infinity` blocks                                |

## Refuted

A flag left set by an overtaken reset (`reset()` clears it before its first await; the success path checks the
generation first); a successful first block, an empty data set, a later block failing, a reload or new data options
mid-load, a retry that then succeeds, a reset while a request is in flight and scrolling back to the top (each as on
`main`, most with a spec); an incremental first block that fails its size check (recorded in the PR); the data options
throw (impossible under the types); `aria-setsize` and the positions A7a added (`-1` on the failed rows, then `100`);
an effect loop or per-row work (`scrolls` is a plain field read only by `setScrollPosition`); the table's path (the
same call); the test failing on `main` (the scroll dropped every block with a total of 0); a Breaking line (no app
relies on the bug); the API file (private members only).
