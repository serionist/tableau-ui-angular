# #74, metaFn's disable and enable: code review

- **Subject:** issue #74 under #101, PR #104, branch `74-form-group-disable`, base `main` `d5afaf1`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier, at `30c0881`, by reading Angular forms 22.2.3 and RxJS 7.8.2
  from the worktree: as the maintainer set for this release, heavy test runs wait for #101's final pass, and CI ran the
  full lane on the head. Verdict: **clean**, no blocker or major; two minors, fixed, and one that predates the PR, moved
  to its own issue.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                                  | Finding                                                                                                                                                                                                                                                        | Status                                                                                                               |
| --- | ----- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | CHANGELOG, the `disable`/`enable` docs | The new default also recalculates the ancestors' dirty and touched from their enabled children and emits their value and status changes, so a form whose only dirty field is disabled turns pristine; the docs and the Fixed line said only value and validity | fixed: the docs say so, and the line moved under Breaking with `disable(emitEvent, false)` to keep the old behaviour |
| F2  | minor | CHANGELOG, the `emitEvent` doc         | With `emitEvent` false the control's meta, and so its errors and the ancestors' `hasError`, wait for its next event                                                                                                                                            | fixed: the doc and the line say so                                                                                   |
| F3  | minor | `_value$` of groups and arrays         | A subscriber that changes the form while its value emits leaves later subscribers on the old value; it predates this PR                                                                                                                                        | #107                                                                                                                 |

| Improvement                                                     | Answer |
| --------------------------------------------------------------- | ------ |
| Test 2 asserts the form's validity right after `disable(false)` | taken  |
| A FormArray case                                                | taken  |

## Refuted

`emitEvent` and `onlySelf` reaching Angular; several levels deep; arrays; `updateOn: 'blur'`; `alwaysDisabled()`; a
toggling callback looping; the one-way door (the API file records no defaults); the other `metaFn` docs; the tests (two
fail without the fix, the third pins the kept opt-out); the F18 and F19 rows; the docs pages.
