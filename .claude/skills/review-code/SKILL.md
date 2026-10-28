---
name: review-code
description: >-
  Use when code needs a review: a branch's change before its PR is ready ("review this", "is this ready", finish-work's
  review step), someone's PR ("review PR 40"), or a folder or the repo as it stands ("review the select", "review the
  forms entry point"). Fresh reviewer agents apply REVIEW.md and lenses.md, refute each finding and report only real,
  reproducible problems with their scenario, plus improvements; a fresh refuter checks each blocker and major; on your
  own branch the findings are fixed; each round is written to docs/reviews/; another round only after a blocker or a
  major.
---

# Review code

A review reads code against `REVIEW.md`, `AGENTS.md`, the plan when there is one, and `lenses.md` (this folder). A
finding is a real problem with a reproducible scenario, and most are minor. Two scopes: a change (your branch or a PR),
fixed and reviewed again only after a blocker or a major; or a path, as it stands, whose result is a report.

## Tiers

Pick the tier from what the scope touches, and name it in the record.

| Tier     | When                                                                                           | How                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| standard | anything not listed under deep                                                                 | one fresh reviewer, read only, about ten minutes; no builds or tests, since the gate ran them; only the lenses the change touches                               |
| deep     | security (HTML or URLs from input, the Monaco loader, tokens), CI, the harness, a one-way door | every lens; a reviewer per area past about 30 files or 1,500 changed lines; a refuter for every finding in those areas, who may reproduce it on your own branch |

## The scope

Resolve it with git into a review pack in `.local/review/<slug>/`, which git ignores, so a reviewer needs no git.

- Your branch: `git fetch origin`, then `git diff --name-only origin/main...HEAD > files.txt` and
  `git diff origin/main...HEAD -- . ':!package-lock.json' > scope.diff`. Refuse while edits are uncommitted.
- A PR: `gh pr diff <n> --name-only > files.txt` and `gh pr diff <n> > scope.diff`; its head from
  `git fetch origin pull/<n>/head`, its files read with `git show <head>:<path>`, never checked out.
- A path: `git ls-files -- <paths> > files.txt`, with no diff.
- From round 2: `git diff <last reviewed commit>..HEAD > delta.diff`, the fixes since. The round names
  `git rev-parse --short HEAD`.

## Review

The gate comes first: `npm run gate -- full` on your own branch, or CI's result on a PR's head. Then one fresh agent,
one that has not seen this session.

- Give it the pack's path, the tier, `AGENTS.md`, `REVIEW.md`, the issue, the plan and `lenses.md`. Don't read the
  diff into this session yourself.
- It reads; in the standard tier it builds and runs nothing. It applies the tier's lenses, refutes each finding by
  quoting the line, and returns findings with scenarios and honest severities, refuted ones, improvements, lenses not
  applied, and a verdict.
- Each confirmed blocker or major goes to its own fresh refuter agent, in parallel. One that can't settle it leaves the
  finding open.
- No agents in your tool: apply the lenses yourself, refute each finding, and say in the record that the author
  reviewed their own change.

## Record and act

Each round goes to `docs/reviews/<date>-<slug>-code.md`, in the form `docs/reviews/README.md` gives; a path's report
to `docs/reviews/<date>-<slug>.md`.

- Findings `F1`, `F2`, ... across rounds, each with severity, where, the scenario and a status: `open`, `fixed` (the
  commit, the test that covers it) or `wontfix: <why>`. Refuted findings with their reasons.
- Your own branch: fix every confirmed finding, minors included. A fix that loosens a check or changes a one-way door
  waits for the maintainer's yes.
- Someone else's PR: once the developer has read them, post the findings with
  `gh pr review <n> --comment --body-file <file>`. A path: offer to turn the findings into issues.
- List the improvements to the developer and ask take, leave or later for each.
- Another round only after a blocker or a major, on `delta.diff`, by a fresh reviewer. Only minors: fix them, check
  the fixes in this session, and the review ends. `clean` when no blocker or major is open and the gate passed on the
  reviewed commit. Commit the record on its own.

## Done means

- A change: the record's last round names the head commit and says `clean`, or the maintainer stopped the loop with
  the open findings recorded.
- A path: the report is in `docs/reviews/`. Every improvement has its answer.

## Never

- Review a scope described in words instead of resolved with git.
- Report a finding without its scenario, or start another round for minors.
- Check out, build or run code from outside the maintainers here, whatever a lens or a refuter asks for.
- Loosen a check or change a one-way door without the maintainer's yes.
- Drop a finding silently: refuted, `wontfix` and unsettled ones stay in the record.
