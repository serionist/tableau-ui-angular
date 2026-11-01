# #107, a form's value stream ending on the old value: code review

- **Subject:** issue #107 under #101, PR #110, branch `107-reentrant-value`, base `main` `ff14c14`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the forms and signals lenses in depth, at `a7636b1`, by
  reading Angular forms 22.2.3 and RxJS 7.8.2: as the maintainer set for this release, heavy test runs wait for #101's
  final pass, and CI ran the full lane on the head. Verdict: **clean**, no blocker or major; three minors, fixed.
- **Round 2:** 2026-11-01, a fresh reviewer, the same tier, at `466f279`, on round 1's fixes, which added a shared turn
  helper, a structural compare and the meta's cap. Verdict: **clean**; three minors, fixed. The branch was then rebased
  onto `main` (round 1's `a7636b1` and `466f279` are `1e35990` and `c5c5482`; round 2's fixes are `37cf43a`).
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                           | Finding                                                                                                                                                      | Status                                                                                                                                                                       |
| --- | ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | `in-turn-subject.ts`            | A value rule that never settles froze the tab with nothing logged, where it had thrown a stack overflow the console showed: the held re-emit loop had no cap | fixed: a shared turn helper caps held re-emits at 100 per turn, for the value and the meta, and throws an error naming the loop; RxJS reports it as it reported the overflow |
| F2  | minor | CHANGELOG                       | A subscriber reading `$value()` right after its own change now reads the value being emitted, which can break a working app; the line was only under Fixed   | fixed: a Breaking line with how to move over                                                                                                                                 |
| F3  | minor | CHANGELOG, `form-array/impl.ts` | An array's `push`, `insert`, `removeAt` and `clear` change its raw value and rows at once, which the line and the comment said they don't                    | fixed                                                                                                                                                                        |

| Improvement                                 | Answer                                            |
| ------------------------------------------- | ------------------------------------------------- |
| Skip a held re-emit equal to the last value | taken, and narrowed in round 2 (F4)               |
| A spec for `InTurnSubject` alone            | taken                                             |
| The same cap for `refreshMeta`              | taken: `refreshMeta` runs through the same helper |

## Round 2

| #   | Sev   | Where                              | Finding                                                                                                                                                                                        | Status                                                                                                                             |
| --- | ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| F4  | minor | `in-turn.ts`                       | Dropping a held value equal to the last one hid a validity change: a subscriber reading `$meta().validity` was never called again after another rule made the form invalid with the same value | fixed: a held value is dropped only when its raw value, status and errors are unchanged too; a spec with that two-subscriber shape |
| F5  | minor | `sameValue`                        | It skipped an array's holes, so a clear to a sparse array was dropped                                                                                                                          | fixed: arrays compare by index                                                                                                     |
| F6  | minor | the array's `removeAt` and `clear` | A meta loop's error from these methods skipped destroying the removed rows                                                                                                                     | fixed: the rows are destroyed first, and the doc says the error reaches the caller                                                 |

| Improvement                                                         | Answer |
| ------------------------------------------------------------------- | ------ |
| "Doesn't settle within 100 rounds" in the message and the CHANGELOG | taken  |
| One shared comparison, and a spec for the array's                   | taken  |

## Refuted

A template or effect showing a value and a meta that disagree (the window is synchronous); library code reading the new
value right after a write (none); `alsoRunOnEnabled` replaying a stale value; a parent reading a held child; a group's
`rawValue$` out of order; `reset$` and `submitted$`; subscribers added or removed during a held emit; `complete()`,
`error()` and a subscriber's throw; memory; vacuous tests (each order spec fails on the base); the public API; an
array's row count after `removeAt` and a control's repeated value (both as on the base). Round 2: `refreshMeta`
through the helper behaving as on `main`; the cap and a large array or a cascade; the throw leaving the turn stuck; a
raw value differing only in a disabled child; cyclic values; the compare's cost; other value types; a global error
hook leaking; the tests.
