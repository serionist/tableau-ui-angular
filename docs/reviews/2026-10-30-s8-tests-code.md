# S8, the remaining behaviour tests: code review

- **Subject:** S8 of #24, PR #76, branch `24-s8-tests`, base `main` `eb98447`.
- **Round 1:** 2026-10-30, a fresh reviewer, standard tier, at `b762b74`: about 1,200 lines of new specs and 89 lines of
  library fixes. Verdict: **clean**, no blocker or major; three minors, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes; the full lane in a clean clone outside the main
  checkout (no zone.js), with the coverage floor at 85%.

## Round 1

| #   | Sev   | Where               | Finding                                                                                                                                                                                                        | Status                                                                                                                                      |
| --- | ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | the codebase review | F16, F17 and the resize watcher's part of F144, fixed here, still read open                                                                                                                                    | fixed; F144's Where column keeps the resize watcher, since it lists the finding's places, and its Fix column now says fixed for every place |
| F2  | minor | CHANGELOG           | The `validatorFn` line named only the chained `.metaFn` that threw; a chained `updateValueAndValidity(...)` or `reset(...)` now honours its arguments where Angular's updated the ancestors and marked nothing | fixed                                                                                                                                       |
| F3  | minor | the button spec     | No `<a button>` with an `href` was rendered, so removing the disabled click's `preventDefault` or the href check kept the suite green                                                                          | fixed: an anchor with an href, a disabled and an enabled click                                                                              |

| Improvement                                               | Answer |
| --------------------------------------------------------- | ------ |
| Register the capture listener only on links               | taken  |
| `vi.waitFor` around the tooltip text checks after a hover | taken  |
| Cross-link #74 with the open F19                          | taken  |

## Refuted

A native disabled `<button>`; a routerLink anchor without an href until rendered; Space on an anchor; the loading
button by keyboard and mouse; the capture listener's order in both browsers; stopping the click hiding it from
ancestors (a native disabled button sends none either); the menu-button group's first resize (the same frame as
before); `validatorFn` breaking compilation (its declared type is unchanged); the generic `formArrayControls`;
`formError`'s edge cases; the button on the server; vacuous tests (none); timer, viewport and font dependence; the
date validators (unchanged and right); each fix's test failing without its fix; the floor, the issues and the plan
rows (consistent).
