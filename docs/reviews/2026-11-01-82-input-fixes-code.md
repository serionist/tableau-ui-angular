# #80, #82, #83, #99, inputs that did nothing and an empty autocomplete: code review

- **Subject:** issues #80, #82, #83 and #99 under #101, PR #103, branch `82-input-fixes`, base `main` `d5afaf1`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier, at `6155c77`, by reading: as the maintainer set for this
  release, heavy test runs wait for #101's final pass, and CI ran the full lane on the head. Verdict: **clean**, no
  blocker or major; two minors in the CHANGELOG, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                               | Finding                                                                                                                                                                                                                            | Status                                       |
| --- | ----- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| F1  | minor | CHANGELOG, the `hierarchyMode` line | A manual-mode tree with nested nodes and no `hierarchyParentId` now lays them at the top level, and `$hierarchyParentId()` reads `undefined` where it read the enclosing id: both are changes an app sees, listed only under Fixed | fixed: a Breaking line with how to move over |
| F2  | minor | CHANGELOG, the tooltip line         | It said only `full` mode passed a padding; `lazy` did too                                                                                                                                                                          | fixed                                        |

| Improvement                                                                         | Answer             |
| ----------------------------------------------------------------------------------- | ------------------ |
| The tree page says "in the default `auto` mode"                                     | taken              |
| A tooltip updates when its position, margin or padding input changes while it shows | taken, with a spec |
| The #83 line names the auto-mode fix for nodes under a bound `hierarchyId`          | taken              |

## Refuted

#99: the API (the return type is unchanged), the handle's lifetime, an effect loop, `aria-expanded` and
`aria-controls` while hidden, two inputs sharing one autocomplete, a pick reopening the suggestions, SSR and leaks,
Enter or a modal while hidden. #80: the token leaking or an import cycle, SSR, library styles catching the header. #83:
an import cycle, a node added later going unplaced, a tree nested in another tree's node (as in 0.2.0), a bound
`undefined` parent id. #82: double padding. The tests (each fails on the base). The tooltip page's `full` sample.
