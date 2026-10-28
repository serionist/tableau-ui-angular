# S3, Angular 22 and Vitest: code review

- **Subject:** S3 of #24, branch `24-s3-angular-22`, base `main` `2ec1d31`.
- **Round 1:** 2026-10-28, a fresh reviewer, standard tier, read only, at `7278eba`. Verdict: **clean**.
- **Scope:** the diff without `package-lock.json`, the changed files in full where needed, the built `dist`, the
  plan's S3 row and decisions, the codebase review's F63, F117, F134-F136.
- **Checks on the reviewed commit, run in this session:** the library and the demo build, `ng test` passes in
  Chromium and Firefox, the typings keep `| undefined`, the peers as planned.

## Findings

| # | Sev | Where | Finding | Status |
|---|---|---|---|---|
| F1 | minor | `styles/fonts/downloadFonts.js`; the published `package.json` | ng-packagr 22 publishes the package as `"type": "module"`, so the CommonJS font script throws `require is not defined` for a consumer following Add-Benton-Sans.md; the icon script ran only because its entry point's stub `package.json` has no type | fixed: both scripts are ES modules (the icon script keeps `require.resolve` through `createRequire`); from the built package the font script prints its usage, the old one throws, and the icon script runs from the package and the repo |
| F2 | minor | `angular.json`, `build:github-pages` | With a server build and every route on the client, the shell is `index.csr.html`, so a Pages deploy would 404 at the root | fixed in the plan: S6's `pages.yml` publishes it as `index.html` and `404.html` until `/` prerenders |
| F3 | minor | five tsconfigs; tree node and virtualize templates | Angular 22's migration suppressed two template diagnostics and left six `$safeNavigationMigration()` wrappers, with no step that takes them back | fixed: a comment in `tsconfig.lib.json`; the plan's S4b row turns them back on |
| F4 | minor | `eslint.config.js` `no-deprecated` | The `Injectable` allow silenced every deprecated use repo-wide, for three call sites | fixed: the rule is back to plain `error`; `FB`, `SnackService` and `ClipboardService` each have a line disable with the reason, and the plan's S7 names the PR that removes each |
| F5 | minor | root `package.json` | Dev tools on carets, against the plan's "pinned exactly" | fixed: pinned to the locked versions; the lock only re-syncs its root entries |

## Refuted

The duplicate-output fix changing the template API (`value`/`valueChange` and `expanded`/`expandedChange` keep
their names); `linkedSignal` behaving unlike `model()` (it resets on input change the same way); the removed
`no-conflicting-lifecycle` (gone from angular-eslint 22); `prefix: []` (skips the new `app` default); the stale
`tab` selector disable; `project` next to `projectService` (they conflict); the eight `ngTemplateContextGuard`
disables (false positives, each with its reason); the timer checks (`!== undefined`, handles are never 0); the
Monaco range (the AMD build pins it); the dropped `lib` (TypeScript's default includes DOM); the regenerated lock
(matches the manifests, has the Linux bindings); F117 (the built typings keep `| undefined`); nested test-app
Angular packages (one `@angular/core`); Angular 22's OnPush default (every component already sets it); the F1 test
in S3 (the runner needs a spec, and it fails without the fix); the disabled `deploy-lib.yaml` calling the removed
script (deleted in S6); members made protected (Angular's fix for host binding checks); the `rxjs` range.

## Improvements

| Improvement | Answer |
|---|---|
| The API file (S9) leaves out `protected` members too, so the ten made protected here don't become one-way doors | taken: D7 |
| The codebase review record marks what S3 settled | taken |
| The three `$any(...)` host arguments could go | later: S7, which rewrites those components |
| The PR text gives the right counts: three `$any` sites, six wrappers | taken |
