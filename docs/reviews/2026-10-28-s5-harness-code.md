# S5, the harness: code review

- **Subject:** S5 of #24, branch `24-s5-harness`, base `main` `c5cb4ca`.
- **Round 1:** 2026-10-28, a fresh reviewer, deep tier (the harness), at `512bb35`. Verdict: **needs-fixes**, two
  majors, each reproduced with real commands in scratch repos.
- **Round 2:** 2026-10-28, a fresh reviewer, deep tier on the fixes `512bb35..bb96c9a`. Verdict: **clean**; four new
  minors and one improvement, fixed in this session.
- **Checks on the final commit:** the full lane passes: build, 37 hook tests, `ng test` in Chromium and Firefox, the
  demo build; gitleaks on the branch.

The majors went to no separate refuter: the round 1 reviewer reproduced both end to end, and the fixes cost less than
a refutation.

## Round 1

| #   | Sev   | Where                   | Finding                                                                                                                                                                                                                                                                                                       | Status                                                                                                                                             |
| --- | ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | major | `tools/attribution.mjs` | AI review bots' co-author lines passed the hook and the gate (`gemini-code-assist[bot]`, `chatgpt-codex-connector[bot]`, `devin-ai-integration[bot]`, `google-labs-jules[bot]`, `coderabbitai[bot]`, `Claude Code Action`); a "Commit suggestion" click on GitHub writes one, and squash carries it to `main` | fixed: any GitHub bot is a tool unless it is dependabot, github-actions or renovate under its own name and address; a test per tool's real trailer |
| F2  | major | `.claude/settings.json` | The glued-star `git diff` allows printed files outside the repo (`git diff origin/main...HEAD/../../README.md ../outside/.npmrc`), and no rule reached PowerShell                                                                                                                                             | fixed: allows name whole commands; an ask list for `git diff` paths that leave the repo; every ask and deny twinned for PowerShell                 |
| F3  | minor | `.claude/settings.json` | The hook-bypass denies missed `core.hookspath` in lower case, `git -C . commit --no-verify` and `git commit -an`                                                                                                                                                                                              | fixed; REVIEW.md says text rules can't catch every spelling, and the gate on push and CI are the backstop                                          |
| F4  | minor | `tools/attribution.mjs` | A bare `cursor` refused CSS and Monaco lines                                                                                                                                                                                                                                                                  | fixed: Cursor counts only as the tool's own names                                                                                                  |
| F5  | minor | `tools/gate.mjs`        | The hook tests check passed with no test run                                                                                                                                                                                                                                                                  | fixed                                                                                                                                              |
| F6  | minor | `tools/hooks.mjs`       | pre-push checked HEAD and the working tree, not what the push sends                                                                                                                                                                                                                                           | fixed: each pushed range goes to the gate                                                                                                          |

Improvements, all taken: `GATE_REQUIRE_GITLEAKS=1`; pre-push tests; `*-by:` trailers naming a tool; a Never line in
review-code against posting with tool attribution.

## Round 2

| #   | Sev         | Where                               | Finding                                                                    | Status                                                                                                                            |
| --- | ----------- | ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| F7  | minor       | `tools/gate.mjs`                    | An empty `describe` still passed the hook tests check                      | fixed: a test must pass                                                                                                           |
| F8  | minor       | `tools/attribution.mjs`             | A "Generated with Claude Code" line in `<sub>` tags or `_emphasis_` passed | fixed, with tests                                                                                                                 |
| F9  | minor       | `tools/gate.mjs`                    | One untracked scratch file made a push skip every lint check               | fixed: untracked files don't count, since they are never pushed (decided without asking; the alternative was a line in AGENTS.md) |
| F10 | minor       | `.claude/settings.json`             | The `-n` and `-an` denies matched inside messages ("-analysis", "-name")   | fixed: they match only as a flag; a message with a bare " -n " is still denied, which fails safe                                  |
| I1  | improvement | `tools/gate.mjs`, `tools/hooks.mjs` | A commit authored or committed by a tool passed                            | taken: refused by the hook and the gate, with tests                                                                               |

## Refuted

Claude's own forms in every case, spacing and line ending (all refused); false positives on 558 commits of history
(none); the skills' own commands (allowed, or read-only by default); dependabot, renovate and people with
`users.noreply` addresses (pass); "Co-authored-by: Anthropic Claude" (no tool writes it); the single-backslash asks
(dead, each with a working twin); no deny on reading `core.hooksPath` (start-work reads it).
