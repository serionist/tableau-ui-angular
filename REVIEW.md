# Review

What every review of a change to this repo checks, whoever does it: the maintainer, an agent (`review-plan`,
`review-code`) or another tool. Same rules for all.

## What a finding is

A real problem with a scenario you can reproduce: the input or state, what happens, and why it matters to an app that
uses the library, its users, or the next change.

- No scenario, no finding. Style is Prettier's and ESLint's; taste is the author's, at most an improvement.
- Refute each finding before you report it: quote the line that proves or kills it. A refuted one stays in the record.
- Most findings are minor. An edge case that needs several unlikely things at once is a minor at most.
- Another round only after a blocker or a major. Minors are fixed in the same round, or recorded with a reason.

| Severity | What it is                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| blocker  | script from input runs in a user's session; a secret leaked; a one-way door broken; a component unusable for most apps; a check loosened                                |
| major    | a real app hits it in normal use: a broken forms contract, a keyboard or screen-reader user stuck, a crashed prerender, a leak that grows, new behaviour without a test |
| minor    | everything else that is real: an edge case few meet, a missing doc line, a clumsy message                                                                               |

## Improvements

Apart from findings, only what is clearly worth the edit: a reuse missed, a simpler approach, a step a person must
remember that a check could do.

- No severity, no scenario; never counted, never a reason for another round.
- Not rewording, renaming or reshuffling for taste, and not options for cases nobody hits.
- The author answers each: `taken`, `left: <why>` or `later: <issue>`. "left: not worth it" is a normal answer.

## The questions

Each is a yes or no, and a "no" is a finding.

1. Did `npm run gate -- full` pass on the reviewed commit, the tests green in Chromium and Firefox, and CI on the PR's
   head?
2. Does the change do what its issue and plan say, and nothing nobody asked for?
3. Does it leave the one-way doors in `AGENTS.md` alone, or name the one it changes and link the maintainer's agreement?
4. Does each form control keep the forms contract: `writeValue` with `null` and before init, no `onChange` or dirty
   from a programmatic write, touched on blur, `setDisabledState` honoured?
5. Can a keyboard user and a screen-reader user operate what changed: focus order and return, the WAI-ARIA pattern's
   role and state, a name for every control?
6. Is it safe to render on the server: no `window`, `document` or observer touched while rendering or in a field
   initialiser, so the demo app still prerenders?
7. Does new behaviour have a test that fails without it, and a fix a test that reproduced the bug?
8. No token, key or password in code, tests, docs, commits or the PR, and no HTML built from input?
9. Did the docs move with it: `README.md`, the demo page, `AGENTS.md`, the plan, `CHANGELOG.md`?
10. Is the PR title a plain imperative sentence, does the body say `Closes #<n>` or `Refs #<n>`, and is there no tool
    attribution in any commit, the title or the body?

## The harness

These files decide how every other change is checked:

- `AGENTS.md`, `REVIEW.md`, `.claude/` (`CLAUDE.md`, the settings, the skills), `.mcp.json`;
- `tools/`, `.githooks/`, `.gitleaks.toml`, and `.github/` (the workflows, `dependabot.yml`, CODEOWNERS, the
  templates);
- `eslint.config.js`, `.stylelintrc.json`, `.prettierrc`, the tsconfigs, `angular.json`'s test and lint targets, and
  the `package.json` scripts the gate runs.

A change to them follows these rules.

- One that loosens a check is a blocker unless the maintainer agrees in the PR.
- Loosening includes a gate check dropped or made a skip, a lint rule or a test turned off, a question or a lens
  removed, attribution let through, a permission widened.
- One that only makes a check stricter needs no more than a normal review.

## Permissions

`.claude/settings.json` can't stop every command that reads a file or skips a hook; the gate on push and CI are the
backstop.

- The `Read` denies don't cover the shell: `git diff --no-index`, `git blame --contents`, or a path outside the repo
  print any file.
- An allow names its whole command; a ` *` only where git can't leave the repo, or where gh only reads from GitHub.
- Claude Code runs git's read-only forms without an allow, so the paths that leave the repo get an `ask`, and the hook
  bypasses a `deny`.
- Text rules can't catch every spelling (`core.HOOKSPATH`, a combined `-vn`): the gate's attribution check catches
  what they let through.
- Bash rules don't reach PowerShell, so each ask and deny has a `PowerShell(...)` twin.
