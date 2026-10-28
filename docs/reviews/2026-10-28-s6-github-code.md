# S6, GitHub: code review

- **Subject:** S6 of #24, PR #33, branch `24-s6-github`, base `main` `a89cb80`.
- **Round 1:** 2026-10-28, a fresh reviewer, deep tier (CI and the harness), at `1e752c9`. Verdict: **clean**; three
  minors and three improvements.
- **Checks:** every check green on the PR, at `1e752c9` and again at `44e2ace` after the fixes: the full lane on Linux
  with Node 22 and 24 (gitleaks required, tests in Chromium and Firefox), the Windows build and pack, `CI`, `PR text`,
  CodeQL for JavaScript and TypeScript and for actions.

## Findings

| #   | Sev   | Where                                | Finding                                                                                                                                                                 | Status                                                                                                                                         |
| --- | ----- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | `tools/pr-text.mjs`; the PR template | `PR text` accepted any `#n` anywhere, so a body that left the template's bare `Closes #` passed by mentioning another number, and the squash commit would link no issue | fixed (`b78e69d`): a `Refs`, `Closes` or `Fixes #<n>` line outside comments and code is required, a bare one is refused; tests moved and added |
| F2  | minor | `.github/workflows/pages.yml`        | Runs that would skip joined the `pages` concurrency group and could replace a pending deploy, leaving the site one deploy behind after a burst of merges                | fixed (`f16d9f3`): only a run that will deploy joins the group                                                                                 |
| F3  | minor | `CHANGELOG.md`                       | It said the chip control wrote debug logs in production; the chip control never shipped                                                                                 | fixed (`8477465`)                                                                                                                              |

## Questions for the maintainer

| Question                                                                                                                          | Answer               |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| CONTRIBUTING licenses contributions under AGPL-3.0 and MIT, so the move to MIT needs no outside contributor's agreement: keep it? | Kept                 |
| Apply the ruleset, the merge settings, private vulnerability reporting and Dependabot security updates?                           | Yes, after the merge |

## Refuted

`if: always()` on the `CI` job (it passes only when both legs succeed; a cancelled leg fails it); script injection (no
`${{ }}` in any `run:`); `pages.yml` running fork code (it builds only from a push to `main` whose CI passed, at
`main`'s head); cache poisoning (PR caches are scoped to the PR; Pages and PR text cache nothing); secrets and token
scopes (no secret used; `contents: read` by default; `security-events`, `pages` and `id-token` only on the jobs that
need them; no persisted credentials); action pins (each SHA equals its tag); the gitleaks checksum (matches the
release and GitHub's digest); the gate's base (PR base, push `before`, a `HEAD~1` fallback); missing browsers (Vitest
fails rather than skips); Dependabot's PRs (its author, committer and trailers pass the attribution check; `PR text`
skips it as success); `dependabot.yml` (parses; groups and cooldown as omniverse-mcp's); the first deploy (Pages from
a workflow, the environment limited to `main`, the base href and the `index.html` and `404.html` copies); CHANGELOG's
Breaking lines (match #27, #28 and the plan); AGENTS.md (130 lines) and the skills (match the new files).

## Improvements

| Improvement                                                                                      | Answer                                                                 |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Hold `monaco-editor`'s minor updates in Dependabot, since the library's peer range stops at 0.53 | taken (`8477465`)                                                      |
| Check the squash message before the merge, not only after it lands                               | taken (`b78e69d`): `node tools/pr-text.mjs --text`, run by finish-work |
| Auto-merge Dependabot's minor and patch PRs, setting the squash message itself                   | later: #34, the maintainer's call                                      |
