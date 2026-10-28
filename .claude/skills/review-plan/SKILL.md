---
name: review-plan
description: >-
  Use when a plan in docs/plans/ is drafted and needs checking before any code ("review the plan", "is this plan
  ready", start-work's review step). A fresh reviewer agent applies REVIEW.md and lenses.md, refutes each finding and
  reports only real defects with their scenario, plus improvements; a fresh refuter checks each blocker and major; the
  round is written into the plan's Plan review section; another round only after a blocker or a major.
---

# Review a plan

A plan review catches a design defect while it is still a one-line edit. A finding is a defect that would really hurt
if the plan were followed as written (`REVIEW.md`, What a finding is), and most are minor.

## Prepare

The round names a fixed version of the plan, and the reviewer gets paths, not this session's reading of them.

- Commit the plan first, then name it by path and commit: `git log -1 --format=%h -- docs/plans/<date>-<slug>.md`.
- The ground truth: `AGENTS.md`, `REVIEW.md`, the plan in full, its issue (`gh issue view <n> --comments`), and every
  file and doc the plan names.
- The tier, as `review-code` sets it: standard, or deep when the plan touches security, CI, the harness or a one-way
  door.

## Review

One fresh agent, one that has not seen this session, reads and nothing else.

- Give it the plan's path, the ground-truth list, the tier and `lenses.md` (this folder). Don't read the ground truth
  into this session yourself.
- It applies the lenses the plan touches, refutes each finding by quoting the plan and the rule or code, and returns
  the confirmed and refuted findings with scenarios and honest severities, the improvements, and a verdict.
- Each confirmed blocker or major goes to its own fresh refuter agent, in parallel. One that can't settle it leaves
  the finding open, never refuted.
- No agents in your tool: apply the lenses yourself, refute each finding, and say in the record that the author
  reviewed their own plan.

## Record and act

The round goes into the plan's "Plan review" section as `### Round <n>`, as the modernization plan's rounds do.

- Its How, Verdict and Now lines, then `| # | Sev | Finding | Status |` with ids `P1`, `P2`, ... across rounds.
- Refuted findings under "Refuted" with their reasons; owner calls as `| # | Owner call | Recommendation | Answer |`;
  the improvements with their answers.
- Fix each finding that keeps the plan's design and scope, and mark it `fixed`. One that changes either goes to the
  maintainer as a yes or no question with your recommendation.
- Another round only after a blocker or a major: commit the edits, and a fresh reviewer reads them and the open
  findings. Only minors: fix or record them, and the loop ends.
- `approved` when no blocker or major is open, every owner call has its answer, and the plan names its tests and docs;
  otherwise `needs-fixes` or `needs-answers`. Commit the plan.

## Done means

- The plan's Plan review says `approved`, or the maintainer stopped the loop with the open findings recorded.
- Every owner call and every improvement has its answer.

## Never

- Report a finding without its scenario, or raise a minor's severity to keep the loop going.
- Change the plan's design or scope without the maintainer's yes.
- Approve a plan with an open blocker on security, a one-way door or the harness.
- Drop a finding silently: refuted and `wontfix` ones stay in the plan.
