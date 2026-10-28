---
name: start-work
description: >-
  Use when someone wants to work on something in tableau-ui-angular ("let's do #31", "fix the select's keyboard
  handling", "add an input to the table", "pick up the plan's next step"), before any code or docs change. Finds or
  opens the issue, reads the code and the APIs it touches, decides whether it needs a plan, writes the plan and reviews
  it with review-plan until it is approved, then makes the worktree and its branch from origin/main.
---

# Start a change

Every change reaches `main` through a PR (`AGENTS.md`, How a change lands). This skill gets a change to where code can
start: an issue, a plan when it needs one, and a worktree. `finish-work` closes it.

## The issue

Every change has one on serionist/tableau-ui-angular, a typo included: its PR names it.

- A number: `gh issue view <n> --comments`, read in full. Closed? Ask before going on.
- A sentence: look for an open one first, `gh issue list --search "<words>"`.
- None fits: write the body to `.local/issue-body.md`, what and why, then
  `gh issue create --title "<title>" --body-file .local/issue-body.md`.

## Read before planning

Read what the change touches, never from memory.

- The entry point's folder in `projects/component-library/`, its specs, and its page in `projects/test-app/src/app/pages/`.
- What consumers see of it: `src/public_api.ts`, the styles, the shipped scripts, `README.md`.
- `REVIEW.md`, and the plan in `docs/plans/` the issue belongs to, with its progress log.
- Every Angular, Vitest or Playwright API it will call, through the Angular CLI's MCP server or Context7.

## The plan

`docs/plans/README.md` says which changes need one. Unsure: ask, and recommend one for anything that touches a one-way
door.

- Write it at `docs/plans/<today>-<slug>.md` from the template there, `issue` set, every section filled.
- Review it with `review-plan` until its verdict is `approved`.
- Ask the maintainer to approve it, with its path and the verdict. No code before the yes; then fill `status`,
  `approved_by` and `approved_at`.
- A step of a plan already approved needs no new plan: its PR adds the step's line to that plan's progress log.
- Someone outside the maintainers puts the plan up as a draft PR titled `Plan: <title>`, and it is approved there.

## The worktree

Each change gets a worktree and a branch `<n>-<slug>` from `origin/main`, so no two sessions share a checkout.

- `git fetch origin`, then `git worktree add .claude/worktrees/<n>-<slug> -b <n>-<slug> origin/main`.
- In it, `npm ci`: its own `node_modules`, never a link to another checkout's (`AGENTS.md`, Traps).
- `npm run setup` once per clone, if `git config core.hooksPath` doesn't print `.githooks`.
- Move the session there, and commit the plan as the first commit: subject `Plan: <title>`, body `Refs #<n>`.
- Ask how to build: in this session, or in forked agents for independent steps, each brief naming the plan, the step
  and the folders it may touch.

## Done means

- The issue exists, and a change that needs a plan has one, approved and committed first on its branch.
- The worktree exists from `origin/main`, with `npm ci` run in it, and how to build is chosen.

## Never

- Write code before the plan is approved, or on `main`.
- Plan from memory of the code or of an API instead of reading it.
- Keep a plan only in the session, an issue comment or a PR body: the plan is a file.
- Post an issue or a comment with tool attribution in it.
