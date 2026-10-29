---
title: Modernize tableau-ui-angular and release 0.2.0
issue: '#24'
status: approved
approved_by: serionist
approved_at: 2026-10-28
---

# Modernize tableau-ui-angular and release 0.2.0

This plan is the record of the modernization: its decisions, design, steps and progress log. Read it first when
picking the work up, and update its progress log at the end of every step.

It brings the repo in line with the maintainer's other projects (docket, WriteableFileProviders, omniverse-mcp): one
rule file for every agent, a review contract, one check script that hooks and CI both run, CI with pinned actions, and
a release that publishes from a tag. The codebase review it builds on is
[2026-10-28-codebase.md](../reviews/2026-10-28-codebase.md): 144 findings, 3 blockers, 39 majors.

## Goal

When this is done, `tableau-ui-angular@0.2.0` is on npm for Angular 22, published from a tag with provenance, and:

|                                |                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fixed                          | The review's blockers and majors, each pinned by a test; the two shipped blockers also patched in 0.1.129                           |
| Checked                        | Lint, format, types, behaviour tests in Chromium and Firefox with axe checks and a coverage floor, the public API file, on every PR |
| Safe to server-render          | No component touches `window` or `document` while rendering; the demo app, then the docs site, is prerendered in CI                 |
| Documented                     | A docs site on GitHub Pages that shows each sample next to its code, and a short README                                             |
| Worked on like the other repos | AGENTS.md, REVIEW.md, the skills, plans and review records                                                                          |
| Licensed                       | MIT, once Starschema agrees                                                                                                         |

In scope: the 0.1.129 patch, the toolchain, the harness, GitHub, the review's fixes, tests, the API file, the docs
site, the presentation, the licence, the release.

Out of scope (under Later): new components, a real stepper, the review's minor accessibility findings (to issues),
Storybook, `1.0.0`.

## Decisions

Taken by @serionist on 2026-10-28 unless the row says otherwise.

| #   | Decision                                      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | No tool attribution on `main`                 | No AI co-author trailers, "Generated with" lines or session links in commits, PR titles or PR bodies. The history has none today. Squash commits are built from the PR title and description (set on 2026-10-28), and a `commit-msg` hook and a PR text check keep it so (S5, S6).                                                                                                                                                         |
| D2  | MIT                                           | "the tableau-ui-angular contributors", as WriteableFileProviders and Tableau.Api. 105 commits are from Starschema addresses, so the switch waits for Starschema's agreement (S12). The release doesn't wait: if the agreement comes later, 0.2.0 ships under AGPL-3.0 and the next release under MIT.                                                                                                                                      |
| D3  | The full loop                                 | start-work, review-plan, review-code, finish-work. Plans in `docs/plans/`, review records in `docs/reviews/`. One issue for this plan, one PR per step, squash-merged once its review is clean and its checks pass: by Claude, under the maintainer's standing approval (2026-10-28), which leaves the release and one-way-door changes to the maintainer.                                                                                 |
| D4  | Angular 22 and Vitest                         | `ng update` to 22; Karma goes, Vitest through Angular's `unit-test` builder in browser mode, because the virtual scroller, overlays and focus need real layout. Peers `^22.0.0` for `@angular/*`. Node `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`, Angular 22's own range, in the root `package.json` and CI; the published package has no `engines` (F135). The 0.1.x line stays on npm for Angular 20 apps, with no backports after 0.1.129. |
| D5  | Release from a tag                            | One version, in `projects/component-library/package.json`; a dated `## X.Y.Z (YYYY-MM-DD)` CHANGELOG section; npm trusted publishing with provenance, so no `NPM_TOKEN`; an `npm` environment with the maintainer as reviewer; the GitHub release's notes are the CHANGELOG section. First release `0.2.0`; in 0.x a minor may break, under CHANGELOG's Breaking.                                                                          |
| D6  | Names stay                                    | npm `tableau-ui-angular`, repo `serionist/tableau-ui-angular`, entry points `tableau-ui-angular/<folder>`, the `tab` selector prefix, the `TableauUi*` modules. Renaming 46 selectors would cost every user a migration for taste. They become one-way doors at 0.2.0. (Recommended.)                                                                                                                                                      |
| D7  | The public API file                           | The built `.d.ts` of every entry point, without `private` and `protected` members (protected ones are template-only in Angular), committed under `projects/component-library/api/`. It holds the exports and, through Angular's declarations, each component's selector, inputs and outputs. CI builds and compares; a change to it is named in the PR. (Recommended.)                                                                     |
| D8  | The demo app becomes the docs site            | Each sample is a small component of its own, shown next to its source, which the build reads as text. GitHub Pages deploys from `main` after CI, and never publishes to npm. (Recommended.)                                                                                                                                                                                                                                                |
| D9  | Not affiliated                                | "Not affiliated with or endorsed by Tableau or Salesforce", Tableau.Api's wording, in the README, the package description and the docs site's footer. (Recommended.)                                                                                                                                                                                                                                                                       |
| D10 | Tests check behaviour                         | Each component's contract: inputs and outputs, keyboard, the forms contract, ARIA state. Not every line. The coverage floor only rises. (Recommended, as docket.)                                                                                                                                                                                                                                                                          |
| D11 | CI legs                                       | Linux on Node 22 and 24, with the browser tests in Chromium and Firefox (F3 broke only Firefox); Windows on Node 24 for the build and the scripts consumers run, from the packed tarball. (Recommended.)                                                                                                                                                                                                                                   |
| D12 | Patch 0.1.129 first                           | F1 (the dialog title's XSS) and F2 (Monaco scrambling typed text) are fixed on what is published. The repo's `NPM_TOKEN` is dead (npm revoked classic tokens in December 2025), so the maintainer replaces it with a 1-day granular token before the merge; the merge then lets today's workflow publish 0.1.129 one last time. A GitHub security advisory covers F1. (Token: Q1, 2026-10-28.)                                             |
| D13 | The 8 local commits land as they are          | After 0.1.129, the old workflow is turned off, and the virtualize container and the chip control merge in their own PR, so nothing publishes. Their findings are fixed in S7 and ship in 0.2.0.                                                                                                                                                                                                                                            |
| D14 | SSR-safe in 0.2.0                             | One pattern across the ~20 places in F144: `inject(DOCUMENT)`, `afterNextRender` for observers and measuring, no browser globals in field initialisers. Prerendering in CI proves it.                                                                                                                                                                                                                                                      |
| D15 | Accessibility: what blocks users              | The review's accessibility majors (F11, F12, F13, F41, F42, F71, F95) to their WAI-ARIA patterns, and an axe check in every component test. F133 (the unnamed icon inside most components) is fixed first, in S7a. Any other axe rule a deferred minor trips is turned off in that test with its issue number, and that list only shrinks. The other minor accessibility findings become issues for after 0.2.0.                           |
| D16 | Dependabot merges its minor and patch updates | Once CI and PR text pass, through GitHub's auto-merge, squashed to the title and a line naming what moved; a draft holds one; majors wait. The merge starts no workflow on `main`, so CI also runs daily on `main`. Taken by @serionist on 2026-10-28 (#34).                                                                                                                                                                               |

## Design

### The 0.1.129 patch (S1)

- PR #25, from `origin/main` (0.1.128's commit): `textContent` for the dialog title; the Monaco effect skips
  `setValue` when the text is unchanged, and `writeValue(null)` becomes `''` (F119, the same lines).
- No test framework runs yet, so the PR shows each fix in the demo app by hand, before and after.
- Before the merge, the maintainer replaces `NPM_TOKEN` with a granular token: write on `tableau-ui-angular` only,
  bypass 2FA, a 1-day expiry.
- The merge runs `deploy-lib.yaml`, which publishes 0.1.129. Then `gh workflow disable deploy-lib.yaml` until S6
  deletes it, and the maintainer revokes the token and deletes the secret.
- The advisory names the versions that set the title with `innerHTML`, and 0.1.129 as the fix.

### Toolchain (S3, S4)

- `ng update` 20 to 21 to 22, one major at a time, each building. TypeScript and `ng-packagr` move with it.
- `package-lock.json` is committed and CI runs `npm ci`. Dev tools are pinned exactly.
- The package is built with `ng build` in its production configuration, never bare `ng-packagr`, so the published
  typings are strict (F117). The root `package` and `publish` scripts go.
- Peers, settled here with the Angular ones: `@angular/*` `^22.0.0`; `rxjs` `^7.4.0` as a peer (F136);
  `monaco-editor` optional (`peerDependenciesMeta`), with the range the tests run on (F134).
- Vitest replaces Karma in `angular.json` for both projects, in browser mode through Playwright, on Chromium and
  Firefox, with `@vitest/coverage-istanbul` (the V8 provider can't cover Firefox). The 65 scaffold specs are deleted:
  each only checks that a component is created. The `storybook` targets, whose packages are not installed, go too.
- The demo app is prerendered from S3 (in CI from S6), at first with no routes. S7a starts, with F133, by making the
  shell SSR-safe: the theme service's fields and the form field. Each S7 PR then adds the routes whose components are
  SSR-safe once it lands, and S7e adds the rest; S10 extends the list to the docs site.
- Prettier, ESLint (angular-eslint) and stylelint stay, with today's settings plus `no-console` (F24, F48). S4a is the
  Prettier reformat of the 35 files alone; S4b holds `.git-blame-ignore-revs` with S4a's `main` SHA, the lint fixes,
  `no-console`, `.gitattributes` and `.editorconfig`.
- `.gitattributes` with `* text=auto eol=lf`: the index is LF already, the Windows checkout is CRLF.

### Harness (S5)

| File                                             | What                                                                                                                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                      | The rules for every agent and person, within 150 lines: what this is, where things are, build and test, how a change lands, writing, commits and PRs, one-way doors, traps, never |
| `.claude/CLAUDE.md`                              | `@../AGENTS.md`                                                                                                                                                                   |
| `REVIEW.md`                                      | No scenario, no finding; blocker, major, minor; the yes or no questions; the harness list                                                                                         |
| `.claude/settings.json`                          | Empty attribution; an allow list of read-only git and gh and the check script; denies on secrets                                                                                  |
| `.claude/settings.local.json.example`            | Opts into the `.mcp.json` servers                                                                                                                                                 |
| `.mcp.json`                                      | The Angular CLI's MCP server (`ng mcp`) and Context7                                                                                                                              |
| `.claude/skills/`                                | start-work, review-plan, review-code (each with `lenses.md`), finish-work                                                                                                         |
| `tools/gate.mjs`                                 | The one check script, Node only, `npm run gate -- quick\|full`                                                                                                                    |
| `.githooks/`                                     | `commit-msg` refuses attribution; `pre-push` runs the quick lane. `npm run setup` turns them on                                                                                   |
| `.gitleaks.toml`                                 | The secret scan's config                                                                                                                                                          |
| `docs/plans/README.md`, `docs/reviews/README.md` | The plan template; how review records are named                                                                                                                                   |

The check script's lanes. Each check lands with its step: the coverage floor in S7, the API compare in S9, the docs
site's prerender in S10.

| Lane  | Runs                                                                                                                                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quick | lock file in sync, ESLint, stylelint, Prettier check, AGENTS.md within 150 lines, each skill's name and description, no attribution in the branch's messages, gitleaks (CI installs it; locally it runs when installed) |
| full  | quick, then the library build, the API file compare, the tests with the coverage floor (never below `origin/main`'s), the demo app's build and prerender                                                                |

The review lenses are the ones this review used, kept: plan and intent, implementation, forms contract, change
detection and signals, accessibility, overlays and the DOM (SSR included), security, public API and packaging, tests,
docs freshness, simplicity, harness integrity.

### GitHub (S6)

- Every workflow: actions pinned by SHA with a version comment, `contents: read` raised per job with its reason,
  `persist-credentials: false`, timeouts, `npm ci` (F121).
- `ci.yml` on PRs and `main`: the full lane on Linux on Node 22 and 24, with gitleaks installed against its sha256;
  on Windows, the build and `npm pack`; one final `CI` job as the required check. S7e adds the shipped scripts' run
  to the Windows leg, once they can pass: the tarball installed into an empty folder with `typescript`, as an Angular
  app has it, and both scripts run from `node_modules/tableau-ui-angular/` against local stubs (an icon CSS server
  behind a base-URL environment variable, an HTTPS font server with a test CA), checking the files they write.
- `pages.yml`: builds and prerenders the docs site from `main` after CI and deploys it. Until `/` prerenders, the build's shell is `index.csr.html`, which the job publishes as `index.html` and `404.html`. `deploy-lib.yaml` is
  deleted.
- `pr-text.yml`: the PR title and body hold no attribution and name an issue, since the squash commit is built from
  them. It reads them from the event file, never through `${{ }}` in `run:`, and skips Dependabot's PRs, whose squash
  message the maintainer cuts to the title and the bump line.
- `codeql.yml`: `javascript-typescript` and `actions`.
- `dependabot.yml`: npm and github-actions, weekly, a 7-day cooldown, minor and patch grouped; Angular and TypeScript
  majors ignored, since they move by `ng update`.
- Issue forms, PR template, CODEOWNERS, SECURITY.md, CONTRIBUTING.md, CHANGELOG.md (Keep a Changelog, with
  Unreleased; it opens with the Breaking lines of S2 and S3).
- Repo settings: squash merges only, auto-merge, delete branches on merge; a ruleset on `main` with PRs only and the
  `CI` and `PR text` checks required; a description and topics (angular, angular-library, component-library,
  ui-components, tableau, typescript). The squash message from the PR title and body, and secret scanning with push
  protection, were set on 2026-10-28.

### The review's fixes (S7)

One PR per area of the review, each fixing its blockers and majors, the minors that sit on the same lines, and its
SSR places, with a behaviour test for each fix, an axe check per component, and its demo routes added to the
prerender list:

| PR  | Area                                                   | Blockers and majors | Also                                                                                                                                    |
| --- | ------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| S7a | Forms                                                  | F4-F13              | F133 first (D15)                                                                                                                        |
| S7b | Select, autocomplete, chip control, menus, date picker | F32-F42             |                                                                                                                                         |
| S7c | Dialogs, snacks, panels, navigation, buttons           | F64-F71             | The stepper entry point removed (F89)                                                                                                   |
| S7d | Table, virtualize, list                                | F3, F91-F95         |                                                                                                                                         |
| S7e | Monaco, theme, clipboard, icon, styles, packaging      | F118, F120          | The icon script on Node's `fetch` instead of an undeclared `axios`, with a base-URL override; F137; the scripts' run on the Windows leg |

F1, F2 and F119 were fixed in S1, F117, F134, F135 and F136 in S3, F121 in S6. Three services keep a line disable for Angular 21's deprecated `providedIn: 'any'` until their area's PR replaces it: `FB` (S7a), `SnackService` (S7c), `ClipboardService` (S7e). Each PR answers the improvements of
its area (taken, left, later) and marks its findings in the review record. Minors it doesn't fix stay open there; the
accessibility ones become issues (D15).

### Release (S13)

`release.yml` on `v*` tags, after WriteableFileProviders' model:

1. The tag is on `main`, equals the package version, and CHANGELOG has its dated section.
2. `npm ci`, the full lane, the package built and packed, `npm pack --dry-run` listed; the tarball is uploaded.
3. A green `ci.yml` run on the tagged commit.
4. Publish in the `npm` environment: the job installs nothing beyond setup-node and runs `npm publish` on the
   uploaded tarball, through trusted publishing, with provenance.
5. The GitHub release, with the CHANGELOG section as notes and the tarball attached.

`docs/releasing.md`: bump the version and date the CHANGELOG in one PR, merge, tag at once, approve the deployment.

## Compatibility

0.1.128 is the latest on npm, at about 180 downloads a month.

| Change                                                                                                                                                                                                                                                                                                                                                                              | How a user moves over                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.129 (S1)                                                                                                                                                                                                                                                                                                                                                                        | Nothing; the title is shown as text, as typed                                                                                                       |
| The table's data types move (S2): `DataOptions`, `IncrementalDataOptions`, `FullDataOptions`, `FullDataRequest`, `IncrementalDataRequest`, `FullDataResponse`, `IncrementalDataResponse` and `DataSort` come from `tableau-ui-angular/virtualize`; `TableComponent` needs its type argument (the `number` default is gone); `dataRowHeight` and `dataPadding` become `[dataRowCss]` | Change the imports, the type annotations and the inputs; a Breaking line in CHANGELOG                                                               |
| Angular 22 peers, `rxjs` a peer, `monaco-editor` optional (S3)                                                                                                                                                                                                                                                                                                                      | Update the app to Angular 22, or stay on 0.1.129; apps that use `tableau-ui-angular/monaco` install `monaco-editor` themselves                      |
| The package is `"type": "module"` and its typings sit under `types/` (S3, ng-packagr 22)                                                                                                                                                                                                                                                                                            | Nothing for entry-point imports; deep `.d.ts` paths change                                                                                          |
| `DatePickerDirective.$value` and `TabTreeNodeComponent.$expanded` are writable signals, no longer models; their inputs' class members are `$valueInput` and `$expandedInput` (S3, Angular 22's duplicate-output rule)                                                                                                                                                               | Code that read the members directly; `[(value)]` and `[(expanded)]` bind as before, and `valueChange` and `expandedChange` now fire once per change |
| Fixes that change behaviour (S7): writes no longer mark forms dirty, touched on blur, the checkbox's label, `writeValue` no longer firing `valueChange`                                                                                                                                                                                                                             | Each has a CHANGELOG line under Breaking with the step                                                                                              |
| The stepper entry point removed (S7c)                                                                                                                                                                                                                                                                                                                                               | It rendered a placeholder; remove its import                                                                                                        |
| MIT (S12)                                                                                                                                                                                                                                                                                                                                                                           | Nothing                                                                                                                                             |

S9 compares the first API file once with 0.1.128's typings, from its npm tarball, and gives each difference not yet
in CHANGELOG a Breaking line before S13.

One-way doors from 0.2.0, into AGENTS.md in S5: the npm name; the entry point paths; every selector, input, output
and exported symbol (the API file); the SCSS import paths under `tableau-ui-angular/styles` and the theme's CSS
custom properties; the shipped scripts' paths and arguments; the peer range.

## Steps

Each step is one PR, buildable and testable on its own.

| Step | What                                                                                                                                                                                                                                 | Proven by                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S0   | This plan, the codebase review, the issue                                                                                                                                                                                            | The plan approved                                                                                                                                                  |
| S1   | The 0.1.129 patch (#25): F1, F2, F119; the token swapped first; the advisory; then the old workflow turned off and the token revoked                                                                                                 | Each fix shown in the demo; `npm view tableau-ui-angular@0.1.129`                                                                                                  |
| S2   | The 8 local commits as they are                                                                                                                                                                                                      | Nothing publishes on merge                                                                                                                                         |
| S3   | Angular 22, the Node range, the peers, Vitest on Chromium and Firefox, `npm ci`, the package built with `ng build`, the demo app prerendered, the scaffold specs, the Storybook targets and the root publish scripts gone            | The library and the demo build and prerender; `ng test` runs in both browsers; the built typings keep `\| undefined`                                               |
| S4a  | The Prettier reformat alone                                                                                                                                                                                                          | Prettier clean                                                                                                                                                     |
| S4b  | `.git-blame-ignore-revs` with S4a's SHA, the lint fixes, `no-console`, `.gitattributes`, `.editorconfig`; the two template diagnostics S3's migration suppressed turned back on, with its `$safeNavigationMigration()` wrappers gone | ESLint and stylelint clean; no diagnostic suppressed                                                                                                               |
| S5   | The harness                                                                                                                                                                                                                          | The quick lane passes; `commit-msg` refuses each attribution form                                                                                                  |
| S6   | GitHub: workflows, templates, SECURITY, CONTRIBUTING, CHANGELOG, settings                                                                                                                                                            | CI green on the PR itself                                                                                                                                          |
| S7   | The review's fixes, S7a to S7e                                                                                                                                                                                                       | Each fix pinned by a test that fails without it; axe clean per component, with the issue-numbered exceptions; each area's routes prerender; the coverage floor set |
| S8   | Behaviour tests for the components S7 didn't reach                                                                                                                                                                                   | The floor raised                                                                                                                                                   |
| S9   | The public API file and its check; the one-time compare with 0.1.128                                                                                                                                                                 | A changed input fails the full lane                                                                                                                                |
| S10  | The docs site with code, prerendered; the README rewrite; the not-affiliated line; the README's broken steps (F139-F143)                                                                                                             | The site prerenders and every sample shows its source                                                                                                              |
| S11  | Presentation: a logo, a social preview, badges, screenshots from the docs site                                                                                                                                                       | The README renders on GitHub in light and dark                                                                                                                     |
| S12  | MIT, once Starschema agrees                                                                                                                                                                                                          | LICENSE and `package.json` say MIT                                                                                                                                 |
| S13  | `release.yml`, `docs/releasing.md`, then the `0.2.0` release PR and tag                                                                                                                                                              | `npm view tableau-ui-angular@0.2.0` shows provenance                                                                                                               |
| S14  | Announce: the awesome-angular list, the release on GitHub                                                                                                                                                                            | The entry is merged                                                                                                                                                |

S1 and S2 come before the plan's merge: they don't depend on it, and S1 shouldn't wait.

## Tests

| Suite                                                             | Runs where   | New or changed                                               |
| ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| Component tests (Vitest, browser mode, Chromium and Firefox, axe) | CI, every PR | New in S3; the fixes' tests in S7; the rest in S8            |
| Prerender of the demo app, then the docs site                     | CI, every PR | S3 (in CI from S6), routes added in S7, the docs site in S10 |
| The API file compare                                              | CI, every PR | S9                                                           |
| The shipped scripts from the packed tarball                       | CI, Windows  | S7e                                                          |

## Docs

- README: short, code first, badges, not affiliated, the broken steps fixed (S10, S11).
- The repo's meta files: AGENTS.md and REVIEW.md (S5); SECURITY.md, CONTRIBUTING.md and CHANGELOG.md (S6).
- `docs/plans/README.md` and `docs/reviews/README.md` (S5); `docs/releasing.md` (S13).
- The docs site: getting started, theming, SSR, one page per component (S10).

## Risks

| #   | Risk                                                                                                   | Status                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| R1  | `ng update` across two majors breaks the library's internals                                           | Accepted; one major at a time, each building, before the tests exist                                  |
| R2  | Browser-mode tests in two browsers are slow on CI                                                      | Accepted; sharded if a leg passes 5 minutes                                                           |
| R3  | Starschema doesn't agree to MIT                                                                        | Accepted; the repo stays AGPL-3.0 and nothing else in the plan changes                                |
| R4  | A merge to `main` publishes a patch while `deploy-lib.yaml` runs                                       | Used once on purpose for 0.1.129 (S1), then turned off; deleted in S6                                 |
| R5  | Trusted publishing needs npm 11.5.1 or later in the publish job                                        | The publish job sets up Node 24, whose npm is 11, and stops unless `npm --version` is 11.5.1 or later |
| R6  | The S1 fixes ship without automated tests                                                              | Accepted; two small changes, each shown by hand, and S7 adds their tests                              |
| R7  | The old workflow's `NPM_TOKEN` is dead, so a merge without a new one tags 0.1.129 and fails to publish | S1 swaps in a 1-day token before the merge                                                            |

## Plan review

### Round 1

- **How:** a fresh reviewer, read only, with `gh` and `npm view`; Claude Opus 5.5; 2026-10-28.
- **Verdict:** needs-fixes (one blocker, one major).
- **Now:** every finding below applied; the owner calls answered.

| #   | Sev     | Finding                                                                                                                                                                                 | Status                                                                                               |
| --- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P1  | blocker | The repo's `NPM_TOKEN` (April 2025) was revoked with npm's classic tokens in December 2025: merging #25 would tag 0.1.129 and fail to publish, and a re-run can't recover               | fixed: D12, S1, R7, For the maintainers (Q1)                                                         |
| P2  | major   | The 8 local commits move the table's data types to `virtualize` and replace `dataRowHeight` and `dataPadding`, and nothing names it: 0.1.128 table users get TS2305 and NG8002 on 0.2.0 | fixed: a Compatibility row, a CHANGELOG Breaking line, S9's one-time compare with 0.1.128            |
| P3  | minor   | Axe fails from the first test on the deferred F133 (`role="img"` without a name, inside most components), so S7 would fix deferred minors or quietly turn rules off                     | fixed: D15, F133 first in S7a, issue-numbered exceptions that only shrink                            |
| P4  | minor   | S7's SSR fixes have no test that fails without them until S10 prerenders                                                                                                                | fixed: the demo app prerenders from S3, each S7 PR adds its routes                                   |
| P5  | minor   | The Node range missed `>=26.0.0`, and written into the package's `engines` it would block Yarn classic users                                                                            | fixed: D4                                                                                            |
| P6  | minor   | 0.2.0 freezes the peers while only `@angular/*` was settled; `monaco-editor ^0.52.2` is required and narrow                                                                             | fixed: Toolchain peers, Compatibility                                                                |
| P7  | minor   | The stepper placeholder would be frozen as a one-way door and shown on the docs site                                                                                                    | fixed: S7c removes it, Compatibility, Later                                                          |
| P8  | minor   | The Windows leg can't show the shipped scripts work for a consumer: `axios` resolves only through hoisting, and the font script needs a live Tableau Server                             | fixed: the leg runs them from the packed tarball against stubs; S7e moves the icon script to `fetch` |
| P9  | minor   | Every Dependabot PR fails `PR text`, and its body could carry co-author lines into the squash                                                                                           | fixed: GitHub                                                                                        |
| P10 | minor   | No secret scan was sure to run: gitleaks only "when installed", GitHub's scanning off                                                                                                   | fixed: CI installs gitleaks; secret scanning and push protection on since 2026-10-28 (Q2)            |
| P11 | minor   | No attribution guard before S5 and S6, and squash commits were built from the commit messages                                                                                           | fixed: the squash message from the PR title and body since 2026-10-28 (Q2); D1                       |
| P12 | minor   | S4 as one PR can't hold its own squash SHA, and the blame skip would hide lint fixes                                                                                                    | fixed: S4a and S4b                                                                                   |
| P13 | minor   | The review record used the old step numbers                                                                                                                                             | fixed in the record                                                                                  |

Refuted: V8 coverage with Firefox (the builder picks istanbul when it is installed; kept as an improvement); the full
lane failing before its checks exist (each is placed); provenance and `repository.url` (they match); other XSS sinks
(none); exploit details public before the fix (the PR is public and the patch publishes in minutes); `npm ci` with
`id-token: write` (kept as an improvement); the API file holding selectors and inputs (it does); trusted publishing's
requirements (correct); the index being LF (it is); the 65 specs (65 on local `main`); the Starschema count (105, the
agreement covers both domains); Angular 21 apps (an open choice in D4); the CHANGELOG heading (both forms parse); the
lock file's stale version (the quick lane catches it); zone mode in tests (the demo app is zoneless).

| #   | Owner call                                                 | Recommendation                        | Answer                       |
| --- | ---------------------------------------------------------- | ------------------------------------- | ---------------------------- |
| Q1  | How 0.1.129 reaches npm with a dead token                  | A 1-day granular token, revoked after | 1-day token                  |
| Q2  | Set the squash message and secret scanning now, before #25 | Both now                              | Both now, applied 2026-10-28 |

| Improvement                                                                                                    | Answer                                                       |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `@vitest/coverage-istanbul` for Firefox coverage                                                               | taken                                                        |
| One line on when each check lands                                                                              | taken                                                        |
| The publish job installs nothing and publishes the build job's tarball                                         | taken                                                        |
| After the first trusted publish, "require 2FA and disallow tokens"; the `npm` environment limited to `v*` tags | taken                                                        |
| The coverage floor never below `origin/main`'s, checked by the script                                          | taken                                                        |
| `PR text` requires an `API:` line when the API file changes                                                    | left: the API file's diff in the PR already names the change |
| `PR text` reads the event file, not `${{ }}` in `run:`                                                         | taken                                                        |
| The API file without `private` members                                                                         | taken                                                        |
| One-way doors include the scripts' paths and arguments and the theme's CSS custom properties                   | taken                                                        |
| The root `package` and `publish` scripts go; the allow list names read-only commands                           | taken                                                        |

### Round 2

- **How:** a fresh reviewer, read only, on the round 1 fixes and what they changed; Claude Opus 5.5; 2026-10-28.
- **Verdict:** approved. P1 to P13 hold, P4 and P8 only in part, which N1 and N2 finish.
- **Now:** the four minors applied and checked in this session.

| #   | Sev   | Finding                                                                                                                                                                                         | Status                                                                                                                                      |
| --- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | minor | S7a to S7d can't prerender their routes: every route renders inside the app shell, whose theme service reads `window` in its fields (S7e's area); and there is no CI before S6                  | fixed: S7a makes the shell SSR-safe first, routes join as their components become safe, prerender in CI from S6                             |
| N2  | minor | S6's Windows leg can't pass: in an empty folder the icon script misses `axios` and `typescript`, its CSS URL is hard-coded, and the font script reports success on a failed download until F137 | fixed: S6's Windows leg builds and packs; S7e adds the scripts' run with `typescript`, a base-URL override, and checks on the files written |
| N3  | minor | The P2 row named types that never existed (`DataRequest`, `DataResponse`) and missed `TableComponent` losing its `number` default type argument                                                 | fixed: Compatibility                                                                                                                        |
| N4  | minor | Release step 4 ("installs nothing") contradicted R5 ("installs" npm 11.5.1); on Node 22's npm 10 the publish fails after the tag                                                                | fixed: Node 24 set up, `npm --version` checked, nothing else installed                                                                      |

## Decided without asking

Since 2026-10-29 the maintainer has let the steps run without decision rounds. Each call that would have gone to them
is here, proposed, for them to approve or change; a change goes back into the code in a PR of its own. Each step's PR
and review record hold the same calls with more detail.

| Step      | Decision                                                                                                                                                          | Why                                                                                                                                                                                                                                       | Not taken                                                                          | Status   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| S7a (#54) | The library's icon-only buttons (chip remove, select clear, snack close, dialog close, arrow scroll, expansion panel, nav bar and tree toggles) label their icons | Icons are hidden from screen readers by default now (F133), which would leave those buttons unnamed                                                                                                                                       | Leaving each to its area's PR                                                      | proposed |
| S7a (#54) | The arrow scroll's SSR fix, from the dialogs area, lands here                                                                                                     | The shell's nav bar measured on the server, so no route could prerender without it                                                                                                                                                        | Every route client-rendered until S7c                                              | proposed |
| S7a (#54) | No hydration (`provideClientHydration`) yet                                                                                                                       | Hydration needs every shell component's server DOM to match the client, before those areas are fixed                                                                                                                                      | Hydration now                                                                      | proposed |
| S7a (#54) | The form field names a custom control by setting `aria-labelledby` on the element it focuses                                                                      | The select and chip control stay unchanged                                                                                                                                                                                                | A token each control reads, a new export                                           | proposed |
| S7a (#54) | `alwaysDisabled()` makes `enable()` do nothing on that control                                                                                                    | It never flickers enabled                                                                                                                                                                                                                 | Disabling it again in a microtask                                                  | proposed |
| S7a (#54) | Register functions take an optional `DestroyRef` as their last parameter                                                                                          | Keeps the fluent chaining                                                                                                                                                                                                                 | Returning a teardown                                                               | proposed |
| S7a (#54) | The radio group matches equal dates by time                                                                                                                       | The only `Primitive` compared by reference                                                                                                                                                                                                | A `compareWith` input                                                              | proposed |
| S7a (#54) | The checkbox's and radio group's `value` is an input, `$value` a signal linked to it, and `valueChange` an output each user change emits (Breaking)               | A model that already held the user's new value emitted nothing; the date picker and tree node do the same                                                                                                                                 | Keeping the model with a separate linked signal                                    | proposed |
| S7a (#54) | The value pipes return the value by default, as their types say (Breaking)                                                                                        | The raw default leaked disabled fields under a value type                                                                                                                                                                                 | Keeping the raw default and fixing the types                                       | proposed |
| S7a (#54) | The checkbox and radio group are touched on blur; a click on the hint no longer toggles                                                                           | Angular's own controls and REVIEW.md's forms question                                                                                                                                                                                     | Touched on change                                                                  | proposed |
| S7a (#54) | `FB` is `providedIn: 'root'`                                                                                                                                      | Angular 21 deprecates `'any'`; the plan put `FB` in S7a                                                                                                                                                                                   | Keeping `'any'` with its line disable                                              | proposed |
| S7a (#54) | The test helper for axe always turns off three page-level rules (`region`, `landmark-one-main`, `page-has-heading-one`)                                           | A test fixture is not a page                                                                                                                                                                                                              | Wrapping every fixture in a page landmark                                          | proposed |
| S7a (#54) | The demo build check fails on 0 prerendered routes or any logged `ERROR`                                                                                          | Angular logs a page that throws while prerendering and goes on                                                                                                                                                                            | Counting routes only                                                               | proposed |
| S7a (#54) | The coverage floor starts at 26% of lines (921 of 3,497) and only rises                                                                                           | What S7a reaches; S7b to S8 raise it                                                                                                                                                                                                      | A higher floor up front                                                            | proposed |
| S7a (#54) | A child's meta change rebuilds only the part built from the children, from their current metas; a group's own flags wait for its own event                        | Angular's `enable()` made the group enabled before its children, which a rule run on enable saw; and a refresh costs the direct children. The cost: a write with `emitEvent: false` shows in a parent's meta at that control's next event | Taking only `enabled` from the group's own `StatusChangeEvent`                     | proposed |
| S7a (#54) | A group's `valueIsDefault` and `childControls` show a write with `emitEvent: false` at that control's next event, as `Meta`'s JSDoc says                          | They come from the children's last metas, so a refresh costs the direct children; a FormArray's own edits refresh it and its ancestors                                                                                                    | Rebuilding them from the controls on every refresh, which cost N squared on N rows | proposed |
| S7a (#54) | The checkbox's and radio group's writable state keeps the public name `$value`, the input's member is `$valueInput`                                               | The date picker's names, so `$value()` reads the current value                                                                                                                                                                            | A protected `$checked` beside a `$value` input                                     | proposed |
| S7a (#54) | The quick lane refuses an `istanbul`, `c8` or `v8` ignore comment under the library, in `.ts`, `.js`, `.mjs` and `.html` files                                    | A comment would take code out of what the floor measures without a harness edit                                                                                                                                                           | Checking it in the full lane only                                                  | proposed |
| S7a (#54) | The test runs and the prerender verdict live in `tools/angular.mjs`, with their tests                                                                             | They read Angular's files and output, apart from the floor in `tools/coverage.mjs`                                                                                                                                                        | One module for every check                                                         | proposed |
| S7a (#54) | A failed tests check prints only the failed runs' output, then each failed test's assertion                                                                       | A failed library run was hidden behind the demo app's passing output, and a stack trace filled the 40 lines printed                                                                                                                       | A longer tail                                                                      | proposed |

## Progress log

- 2026-10-28: the reference repos read through their sessions (docket, omniverse-mcp) and files
  (WriteableFileProviders); decisions D2 to D5 taken; issue #24 opened; the codebase review (five reviewers, a
  refuter per area, F3 reproduced in Firefox 143); decisions D12 to D15 taken; PR #25 (S1) opened, both fixes shown
  in the demo before and after; plan review round 1; the squash message and secret scanning set; the token
  replaced and #25 merged (`1a1d792`); plan review round 2, approved.
- 2026-10-28, S1: the old workflow pushed the 0.1.129 commit and tag but failed to publish with `EOTP` (the new token
  didn't bypass 2FA); the workflow was turned off, the maintainer published 0.1.129 by hand from the `v0.1.129` tag
  (shasum `06b9dec`), and the `NPM_TOKEN` secret was deleted; the advisory drafted (GHSA-pf6h-4mjg-cmrw) for the
  maintainer to publish.
- 2026-10-28: the plan approved by @serionist; S0 (#26) and S2 (#27) merged; the maintainer revoked the 1-day token
  and published the advisory; issue #24 carries the step list.
- 2026-10-28, S3: Angular 22.2.3, TypeScript 6.0.3, Vitest 5 in Chromium and Firefox with the F1 test, the package
  built strict with `ng build`, the peers settled, the demo app's server build with every route on the client. Review
  round 1 clean, five minors fixed: the shipped scripts became ES modules, since ng-packagr 22 publishes the package
  as `"type": "module"`.
- 2026-10-28, S3 merged (#28). S4a (#29): Prettier's reformat of 33 files alone. S4b: lint clean, `no-console` on the
  library and its 23 debug logs gone, `.gitattributes` with LF, `.editorconfig` at two spaces, `.git-blame-ignore-revs`
  with S4a's commit, the two template diagnostics on again; review round 1 clean.
- 2026-10-28, S5: the harness (AGENTS.md, REVIEW.md, the four skills, `tools/gate.mjs`, the hooks, settings, `.mcp.json`);
  its docs reformat merged first on its own (#31). Review round 1 (deep) found two majors, both fixed: AI review bots'
  co-author lines got past, and glued-star `git diff` allows could print files outside the repo. Round 2 clean.
- 2026-10-28, S4b merged (#30). S5: `AGENTS.md`, `REVIEW.md`, `.claude/` with the four skills, `.mcp.json`,
  `tools/gate.mjs` with both lanes, the `commit-msg` and `pre-push` hooks behind `npm run setup`, their tests,
  `.gitleaks.toml`, and the plan and review templates; the root config files and the docs joined Prettier's scope and
  were formatted. Both lanes pass; `commit-msg` refuses each attribution form, in its tests and on a real commit. Three
  departures: the hooks' tests run as `node --test "tools/*.test.mjs"`, since Node 24 runs `node --test tools/` as one
  file; the Angular CLI's MCP server runs as `node node_modules/@angular/cli/bin/ng.js mcp --read-only`, since `npx`
  needs a `cmd /c` wrapper on Windows and without a local install `npx ng` fetches npm's unrelated `ng` package;
  Prettier 3.5 pads every Markdown table, so the plan's and the records' tables are aligned now.
- 2026-10-28, S5 merged (#32). S6 (#33): `ci.yml` (the full lane on Linux on Node 22 and 24 with gitleaks 8.30.1
  checked against its sha256, the build and pack on Windows, one `CI` job), `pr-text.yml`, `codeql.yml`, `pages.yml`
  and `dependabot.yml`; `deploy-lib.yaml` deleted; the issue forms, the PR template, CODEOWNERS; SECURITY.md,
  CONTRIBUTING.md, CHANGELOG.md; `.github/` in Prettier's scope; the repo's description, homepage and topics set.
  Departures: the PR text rules are `tools/pr-text.mjs`, with tests; the `CI` job runs with `always()`, so a cancelled
  leg fails it instead of leaving it skipped, which a required check counts as passed; Pages deploys only while the
  commit CI passed is still `main`'s head, and keeps a prerendered `index.html` once there is one; CHANGELOG also has
  an Added section for S2's two entry points.
- 2026-10-28, S6 review round 1 (deep, at `1e752c9`): clean, three minors fixed. `PR text` now needs `Refs`, `Closes` or
  `Fixes #<n>` and refuses a bare `Closes #`, since a mention of another issue let the template's bare line through,
  and reads no reference in code, as GitHub links none there;
  only a Pages run that will deploy joins the `pages` group, so one that skips can't take the place of a waiting
  deployment; CHANGELOG no longer says the chip control logged in production, since 0.1.129 has no chip control. Both
  improvements taken: Dependabot leaves `monaco-editor`'s minors and majors alone, and `node tools/pr-text.mjs --text`
  checks the squash message finish-work writes. Left for later: auto-merging Dependabot's minor and patch PRs, the
  maintainer's call (#34). The maintainer answered: CONTRIBUTING's clause stays, so a contribution comes under
  AGPL-3.0 and MIT; the repo settings below are applied after #33 merges.
- 2026-10-28, after S6: #33 merged; the first Pages deploy from `main` is live; the repo settings applied (the ruleset
  "main: PRs only" requiring `CI` and `PR text`, squash only, auto-merge, branches deleted on merge, private
  vulnerability reporting, Dependabot security updates). Dependabot's first batch handled: 13 merged, ESLint 10 (#37)
  closed and ESLint's majors held (#45). The maintainer asked for Dependabot's minor and patch updates to merge once CI
  passes: D16, `dependabot-auto-merge.yml`, and a daily CI run on `main` (#34).
- 2026-10-29, S7a: F133 first, with a `label` input on `tab-icon`; the majors F4 to F13 and the minors on their lines
  (F14, F15, F20 to F22, F25, F26, F29 to F31), each with a test run once against the unfixed code to see it fail;
  F27 and F28 became #52 and #53. axe-core 4.14.0 in every touched component's spec: three page-level rules are always
  off, and no rule is off for a deferred finding. The
  shell renders on the server, and `/checkbox`, `/radios` and `/form-fields` prerender, without hydration, which they
  don't need. The full lane runs the library's tests with coverage, floor 25% in `tools/coverage.json`, and fails a
  prerender that logs an error. `FB` is `providedIn: 'root'`. Departures: the nav bar's arrow scroll also measured on
  the server, so it moved to `afterNextRender` here; hiding icons left the library's icon-only buttons nameless, so
  their icons got labels in this PR.
- 2026-10-29, S7a review round 1 (one major, seven minors), fixed on the branch: a group's own flags wait for its own
  event and a child's change rebuilds only the children's part of its meta, read from their metas, so a rule run on
  enable no longer sees the group enabled before its children, and a refresh costs the direct children; the checkbox's
  and radio group's `value` became an input with an output, as the date picker's; the dialog's close icon is named;
  the gate runs every project's tests, refuses coverage ignore comments, and tests its prerender verdict; the floor
  rose to 26%.
- 2026-10-29, S7a review round 2, clean, five minors fixed on the branch: an array's `push` or `removeAt` with
  `emitEvent: false` refreshes its meta and its ancestors'; `Meta`'s JSDoc says a write without an event shows at the
  control's next event; the dialog's close is a button; CHANGELOG says `.set()` no longer emits; the ignore check
  matches comments as istanbul does.

## For the maintainers

- S1, before #25 merges: replace `NPM_TOKEN` with a granular token (write on `tableau-ui-angular` only, bypass 2FA,
  1 day): `gh secret set NPM_TOKEN -R serionist/tableau-ui-angular`.
- S1, after 0.1.129 is on npm: revoke that token and delete the secret; publish the GitHub security advisory for F1.
- S12: Starschema's agreement to MIT.
- S6, after #33 merges: the ruleset on `main` with PRs only and `CI` and `PR text` required; squash merges only,
  auto-merge on, branches deleted on merge; private vulnerability reporting, which SECURITY.md and the issue forms
  link to; Dependabot security updates (alerts are on); CodeQL's default setup left off, since `codeql.yml` is the
  advanced setup. The description, homepage and topics were set in S6. All applied on 2026-10-28.
- Before S13: on npmjs.com, a trusted publisher for `tableau-ui-angular` (this repo, `release.yml`, environment
  `npm`); the `npm` environment with you as reviewer, limited to `v*` tags.
- S11: upload the social preview in the repo's settings (GitHub takes it only there).
- S13: approve the `npm` deployment; then set the package to "Require two-factor authentication and disallow tokens".

## Later

- The review's minor accessibility findings, as issues.
- A real stepper.
- `1.0.0`, once the API file has held for a few releases.
- New components.
