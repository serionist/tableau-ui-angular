---
name: finish-work
description: >-
  Use when a change is ready ("finish", "wrap up", "we're done", "open the PR"). Checks the docs moved with the change,
  runs the full lane of the gate, commits, opens a draft PR with no tool attribution, reviews it with review-code until
  it is clean, then squash-merges on the maintainer's word or under a standing approval the plan records.
---

# Finish a change

Done means `npm run gate -- full` passed, `REVIEW.md` is answered and `review-code` is clean, not that the work feels
complete. `main` takes squash-merged PRs only (`AGENTS.md`, How a change lands).

## Docs and the gate

Everything that describes the change moves with it, and then the full lane runs.

- What users see: `README.md`, `Add-Benton-Sans.md`, the component's page in the demo app.
- `CHANGELOG.md`: a line under Unreleased when consumers notice the change, under Breaking when it breaks them, with
  how to move over.
- `AGENTS.md` for a changed path, command or rule; the plan where the work departed from it, and its progress log's
  line for the step.
- `npm run gate -- full`. Fix every failure; never weaken a test, a rule or a check to pass.

## The PR

Commit, then open a draft PR: its title and description become the commit on `main`.

- Commits: a plain imperative subject, a body that says why, `Refs #<n>` last. `commit-msg` refuses attribution.
- The body in `.local/pr-body.md`, from `.github/pull_request_template.md`: what and why, the plan or
  `Trivial: <why>`, how it was tested, the review, what was decided without asking, the one-way doors it touches or
  "none", `Closes #<n>` or `Refs #<n>`. The `PR text` check refuses a body that names no issue.
- `git push -u origin HEAD`, which runs the quick lane, then
  `gh pr create --draft --title "<plain imperative sentence>" --body-file .local/pr-body.md`.
- No tool attribution in the title or the body: no co-author lines, no "Generated with", no session links.

## Review and merge

`review-code` until it is clean, then the merge.

- Commit each round's fixes with the quick lane passing, and the record in `docs/reviews/`. Put the verdict and the
  record's path in the body: `gh pr edit <n> --body-file .local/pr-body.md`.
- CI and `PR text` on the head commit: `gh pr checks <n> --watch`, and `gh run view <id> --log-failed` for a red
  one. A red check is fixed, never skipped.
- If `main` moved: `git fetch origin`, `git rebase origin/main`, `git push --force-with-lease`; the full lane again
  when code changed.
- Merge on the maintainer's word, or under a standing approval their plan records, never for a release or a one-way
  door. Write `.local/squash.md`, what and why ending `Refs #<issue>` or `Closes #<issue>`, and check it with the
  `PR text` rules: `node tools/pr-text.mjs --text .local/squash.md`. Then `gh pr ready <n>` and
  `gh pr merge <n> --squash --delete-branch --subject "<title> (#<n>)" --body-file .local/squash.md`.
- After the merge, from the main checkout: `git worktree remove .claude/worktrees/<n>-<slug>`, `git pull`. Work that
  turned up on the way becomes an issue.

## Done means

- The full lane passed on the head commit, and `review-code` is clean for exactly this code.
- The PR is merged, or left for the maintainer as a draft or ready, by their choice.

## Never

- Open, mark ready or merge a PR with a failing gate or CI, or with a review of different code.
- Mark a `REVIEW.md` question yes without its evidence.
- Add tool attribution to a commit, a PR title, a PR body or a squash message.
- Push to `main`, merge without the maintainer's word or standing approval, or push to someone else's branch.
