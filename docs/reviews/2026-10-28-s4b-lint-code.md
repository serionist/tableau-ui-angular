# S4b, lint, logs and line endings: code review

- **Subject:** S4b of #24, branch `24-s4b-lint`, base `main` `e69e168`.
- **Round 1:** 2026-10-28, a fresh reviewer, standard tier, read only, at `61f5fa6`. Verdict: **clean**.
- **Checks on the reviewed commit, run in this session:** the library and the demo build with the two template
  diagnostics on and no warnings, `ng test` passes in Chromium and Firefox, ESLint and stylelint pass, Prettier is
  clean on `projects/`.

## Findings

| #   | Sev | Where                               | Finding                                                                                                                                                        | Status                                                                                 |
| --- | --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| F1  | nit | `.editorconfig`; `eslint.config.js` | The two-space indent now set for every file disagrees with `eslint.config.js`, indented with four spaces, which Prettier's `projects/**/*` scope never touched | left: S5's check script sets Prettier's scope, and the root config files join it there |

## Refuted

The removed logs (standalone statements that only read; no block left empty; the remaining `any` disable still sits
on its cast); null versus undefined after the `$safeNavigationMigration()` wrappers went (the tooltip inputs and
`ngTemplateOutlet` treat both alike); the `no-console` block's scope (library only, specs out, nothing else
loosened); `.gitattributes` (the only binaries, `favicon.ico` and three `.woff2`, are marked binary and stored as
`-text`); the tsconfig edits (valid, only the `extendedDiagnostics` blocks gone); the stylelint fixes (blank lines,
`0rem` to `0`, a redundant shorthand value; the two px values unchanged).
