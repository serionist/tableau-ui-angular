# Plans

A non-trivial change gets a plan here before any code. A fix a reviewer can follow from the PR alone needs none; its
PR says `Trivial: <why>`.

| Needs a plan                                                            | Needs none                                |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| a new component or entry point                                          | a fix inside one component, with its test |
| a change to a one-way door (`AGENTS.md`)                                | a doc or comment fix                      |
| work across several entry points, or the library and the build together | a dev tool's patch or minor update        |
| a dependency or Angular update that changes behaviour                   |                                           |

- One file per plan, `YYYY-MM-DD-<slug>.md`, dated the day it was started.
- Written with `start-work`, reviewed with `review-plan` until approved, approved by the maintainer, and committed as
  the first commit of its branch.
- A plan records what was decided and why at the time: it changes while its branch is open, and not after the merge.
- A plan over several PRs, such as `2026-10-28-modernization.md`, is the exception: each step's PR updates it, and
  after its first merge only its progress log and the decisions taken on the way change.
- Fill every section. "None" is an answer; a blank is not.

## Template

```markdown
---
title: <a plain imperative sentence, which can become the PR title>
issue: '#<n>'
status: draft
approved_by:
approved_at:
---

# <title>

## Goal

What is true when this is done, and why it matters. In scope; out of scope.

## Decisions

| #   | Decision | Detail |
| --- | -------- | ------ |

## Design

How it works: the components, inputs, outputs, services and styles it adds or changes, and the demo pages. The
alternatives considered and why this one.

## Compatibility

The one-way doors it touches (`AGENTS.md`), what breaks for apps (imports, selectors, inputs, styles, peers) and how
they move over, with the CHANGELOG line. Or "none".

## Steps

| Step | What | Proven by |
| ---- | ---- | --------- |

Ordered, each one buildable and testable on its own, each proven by a test that fails without it.

## Tests

The new and changed tests, and where they run: the component tests in Chromium and Firefox, the demo app's prerender,
and what neither can show.

## Docs

The docs that change with it: `README.md`, `Add-Benton-Sans.md`, the demo pages, `AGENTS.md`, `CHANGELOG.md`.

## Risks

| #   | Risk | Status |
| --- | ---- | ------ |

Whether each risk is resolved or accepted.

## Plan review

Written by `review-plan`: each round's reviewer, date and verdict, the findings with their status, the owner calls with
their answers, and the improvements with theirs.

## Progress log

One line per session or step: the date, what landed, what changed from the plan.
```

`issue` is quoted: a bare `#` starts a YAML comment.
