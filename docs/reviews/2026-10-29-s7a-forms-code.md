# S7a, the forms fixes: code review

- **Subject:** S7a of #24, PR #54, branch `24-s7a-forms`, base `main` `b0eea42`.
- **Round 1:** 2026-10-29, two fresh reviewers, split as review-code says for a change over 1,500 lines: the typed
  forms in `form/` (standard tier), and the components, SSR, accessibility, docs and the coverage gate (standard, with
  `tools/` at deep tier), at `056b1a3`. Verdict: **needs-fixes**, one major.
- **Round 2:** 2026-10-29, a fresh reviewer on the fixes `056b1a3..c004db7`. Verdict: **clean**; five minors, fixed in
  the same round.
- **Checks:** every check on the PR green after each round; the full lane locally: the component tests in Chromium and
  Firefox, the coverage floor, three prerendered routes, the tools' tests.

The major went to no separate refuter: its fix began with a spec that reproduced it on the code under review, and
that spec failed there in both browsers.

## Round 1

| #   | Sev   | Where                                              | Finding                                                                                                                                                                                                                                                   | Status                                                                                                                                                                                                           |
| --- | ----- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | major | `abstract-control/impl.ts`, the register functions | A regression: a group's `alsoRunOnEnabled` and `enableChange` rules ran in the middle of Angular's `enable()`, before the later children were enabled, so a rule that enables `state` only with a `country` left it enabled after a disable and an enable | fixed (`e78cc16`): a child's meta change rebuilds only the part of a group's meta built from its children; the group's own flags change on its own events, which come after the children; the spec failed before |
| A2  | minor | `meta/impl.ts`                                     | Every descendant's change rebuilt every ancestor's whole subtree: quadratic on a large array                                                                                                                                                              | fixed: a group's meta reads its children's metas; 50 rows went from 10,451 rebuilds to 101                                                                                                                       |
| A3  | minor | `refreshMeta`                                      | The queue that keeps every subscriber on the latest meta had no test                                                                                                                                                                                      | fixed: a second subscriber in the spec                                                                                                                                                                           |
| B1  | minor | `dialog.service.ts`                                | The header's close icon was focusable and hidden from screen readers                                                                                                                                                                                      | fixed: labelled, with an axe check                                                                                                                                                                               |
| B2  | minor | checkbox, radio group                              | `(valueChange)` stayed silent for a user's change when the model already held that value after a form write                                                                                                                                               | fixed: an input `value`, a linked signal and an output that every user change emits (Breaking)                                                                                                                   |
| B3  | minor | the icons demo page                                | The new `label` input wasn't documented                                                                                                                                                                                                                   | fixed                                                                                                                                                                                                            |
| B4  | minor | the plan, CHANGELOG, `ci.yml`                      | The plan said no axe rule was off; the removed `ngAfterViewInit` had no Breaking line; `ci.yml`'s header missed the coverage floor                                                                                                                        | fixed                                                                                                                                                                                                            |

| Improvement                                                                                    | Answer                                                                                |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A FormArray's child list changes before the FormArray, so `valueChange`'s rows match its value | taken                                                                                 |
| The gate refuses coverage-ignore comments in the library                                       | taken                                                                                 |
| The prerender verdict as a pure function with tests                                            | taken (`tools/angular.mjs`)                                                           |
| Every project's test target runs, coverage for the library only                                | taken                                                                                 |
| Fail whenever the floor sits below the measured coverage                                       | left: the floor rises by hand in the PR that earns it, as WriteableFileProviders does |
| Name the failed project in the tests check                                                     | left: the gate prints only the failed runs' output, which names it                    |

## Round 2

| #   | Sev   | Where                | Finding                                                                                                                                                   | Status                                                                                          |
| --- | ----- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| N1  | minor | `form-array/impl.ts` | An edit with `emitEvent: false` left the array's and its ancestors' validity stale, since the refresh ran before the FormArray call                       | fixed                                                                                           |
| N2  | minor | `meta/impl.ts`       | A group's `valueIsDefault` and `childControls` come from the children's last metas, so a write with `emitEvent: false` shows at that control's next event | documented in Meta's JSDoc and the plan's decision row; a fresh read would bring back A2's cost |
| N3  | minor | `dialog.service.ts`  | The close control said "graphic", not button                                                                                                              | fixed: a button holding the labelled icon                                                       |
| N4  | minor | CHANGELOG            | A Breaking line said `.set()` works as before; it no longer emits                                                                                         | fixed, and the date picker's line too                                                           |
| N5  | minor | `tools/coverage.mjs` | `// xistanbul ignore start` and a comment split across lines got past the ignore check                                                                    | fixed: the whole text is matched, with tests                                                    |

## Refuted

Round 1: `removeAt` below `-length` (no caller passes one); stale metas during a queued emission (needs contradictory
subscribers); a parent's transient stale validity (its own event follows); `alwaysDisabled()` on a group with an
explicitly enabled child (contradictory code); the do-while spinning (it recursed before); NaN (the number accessor
writes `null`); nameless collapsed nav links and icon-only options (nameless before; S7c); hidden sort icons (no
`aria-sort` before; S7d); SSR on the prerendered routes (no globals on the server); a hydration mismatch (no
hydration); lowering the floor (caught against the base); what coverage counts (every library source with code);
dodging the base compare (a harness edit); CI's base on PRs, pushes and schedules; a stale coverage summary (deleted
first); the demo build verdict; the checkbox inside its label.

Round 2: `withChildren` changing a group's own field (it copies all nine); a group missing a child's change while
events are on (Angular emits the parent's own event); `[(value)]` or a form write emitting (B2 holds); an ignore
comment in a template (Angular drops HTML comments); the demo app counting toward the floor; a test target removed
silently (pinned by a test); the prerender verdict loosened; a vacuous test (none).
