# Reviews

What each `review-code` round found and what became of it, committed on the branch it reviewed. A plan's review lives
in the plan's "Plan review" section instead.

| Record                             | File                                                                        | Example                            |
| ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| a change: a branch or a PR         | `YYYY-MM-DD-<slug>-code.md`, the slug the branch's without its issue number | `2026-10-28-s3-angular-22-code.md` |
| a folder or the repo, as it stands | `YYYY-MM-DD-<slug>.md`                                                      | `2026-10-28-codebase.md`           |

Dated the day of the first round; later rounds go into the same file. A record says what was found at the time and is
not kept current: its open findings become issues.

## A change's record

`# <subject>: code review`, then a bullet each for `Subject`, `Round 1`, and `Scope` and `Checks` when they apply.

- Subject: the step or issue, the branch, the base and its commit.
- Round 1: the date, the reviewer, the tier, read only, the commit reviewed, and the verdict: `clean`, `needs-fixes` or
  `needs-answers`.
- Scope: what the reviewer read, when it is more than the diff.
- Checks on the reviewed commit: what this session ran, such as the gate's full lane.

Then its sections, in this order:

| Section           | What                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## Findings`     | `\| # \| Sev \| Where \| Finding \| Status \|`; ids `F1`, `F2`, ... across rounds; the finding states its scenario; the status says what fixed it (the commit, the test) or why it stays |
| `## Refuted`      | each refuted finding, in a line, with its reason                                                                                                                                         |
| `## Improvements` | `\| Improvement \| Answer \|`: `taken`, `left: <why>` or `later: <issue>`                                                                                                                |
| `## Round <n>`    | each later round: its date, reviewer, commit and verdict, then its findings table                                                                                                        |

## A path's record

`# <What> review, <date>`, its scope, how it was read and what follows from it; a verdict; then a findings table per
area, `| # | Sev | Where | Finding | Fix |`, with the refuted findings and the improvements after them.
