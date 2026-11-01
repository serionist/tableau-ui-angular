# #106, markAsDirty and markAsPristine: code review

- **Subject:** issue #106 under #101, PR #108, branch `106-mark-pristine`, base `main` `1f71732`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier, at `f63ded1`, by reading Angular forms 22.2.3 and merging the
  branch with `main` and with #104 in the scratchpad. Verdict: **clean**, no blocker or major; two minors, fixed.
- **Checks:** CI hadn't run at `f63ded1`, since the branch conflicted with `main`; every check green once `main` was
  merged in.

## Round 1

| #   | Sev   | Where                              | Finding                                                                                                                    | Status                                                                                                        |
| --- | ----- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| F1  | minor | the branch, CHANGELOG, the F18 row | `main` had moved (#102), so the PR conflicted and no CI ran; #104 adds a line at the same place and edits the same F18 row | fixed: #104 merged first, then `main` merged in, keeping every line, the F18 row saying both halves are fixed |
| F2  | minor | `form-group/impl.spec.ts`          | No spec had a control below a child, so `allPristine`'s recursion was untested                                             | fixed: a spec marks a nested group's control dirty and the form pristine                                      |

| Improvement                                                                                               | Answer |
| --------------------------------------------------------------------------------------------------------- | ------ |
| The CHANGELOG line: `markAsPristine(true, true)` recalculates the ancestors of a control already pristine | taken  |

## Refuted

Extra events (Angular emits only on a change); `_updatePristine` emitting whatever `emitEvent` says (Angular's own
behaviour); calls the old guard made and the new one skips (nothing to change); disabled children; arrays; `markAsDirty`
checking the control only; nesting with `markAncestors` true; "children" meaning descendants; a pending `updateOn` value;
the branch's doc contradicting its parameter doc (predates the PR; #104 rewrites it); Fixed rather than Breaking; the
tests failing without the fix.
