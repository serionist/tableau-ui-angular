# tableau-ui-angular

The rules for anyone who changes this repo, person or agent. Claude Code reads this file through `.claude/CLAUDE.md`,
other agents read it directly, and the gate keeps it within 150 lines. What the library does for its users is in
`README.md`.

## What this is

Tableau-style Angular components, published to npm as `tableau-ui-angular`, and the demo app that shows them.

- The library, `projects/component-library/`: one secondary entry point per folder, `tableau-ui-angular/<folder>`.
- The demo app, `projects/test-app/`: a page per component, built for the server and prerendered, on GitHub Pages.
- Angular 22, TypeScript 6, Vitest in browser mode on Chromium and Firefox; Node `^22.22.3 || ^24.15.0 || >=26.0.0`.
- Where the work stands: `docs/plans/2026-10-28-modernization.md` takes the repo to 0.2.0; read its progress log first.

## Where things are

Every top-level file and folder, and the library's own; a new one adds its row in the same change.

| Path                                                                      | What                                                                                                                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projects/component-library/<folder>/`                                    | an entry point: `ng-package.json`, `src/public_api.ts`, the components, their specs                                                                   |
| `projects/component-library/public-api.ts`                                | the root entry point, `tableau-ui-angular`, which re-exports every folder                                                                             |
| `projects/component-library/styles/`                                      | the SCSS apps import (`tableau-ui-angular/styles/lib-styles`), the theme, `fonts/downloadFonts.js`                                                    |
| `projects/component-library/used-icons/`                                  | the icon list entry point, and `scripts/update-icons.js`, which apps run                                                                              |
| `projects/component-library/package.json`, `ng-package.json`              | what is published: the one version, the peers, the shipped assets                                                                                     |
| `projects/test-app/`                                                      | the demo app: `src/app/pages/`, `app.routes.server.ts` (what prerenders), its own `package.json`                                                      |
| `docs/plans/`, `docs/reviews/`                                            | plans, with the template in `README.md`; review records. Dated, never current truth                                                                   |
| `tools/`                                                                  | `gate.mjs` (the checks), `hooks.mjs` and `attribution.mjs` (behind `.githooks/`), `pr-text.mjs` (behind `pr-text.yml`), `setup.mjs`, the tests        |
| `.githooks/`                                                              | `commit-msg` refuses tool attribution; `pre-push` runs the gate's quick lane                                                                          |
| `.claude/`                                                                | `CLAUDE.md` (imports this file), `settings.json` (no attribution; whole-command allows, asks, denies: `REVIEW.md`, Permissions), `skills/`            |
| `.mcp.json`                                                               | the Angular CLI's MCP server and Context7; `.claude/settings.local.json.example` turns them on                                                        |
| `AGENTS.md`, `REVIEW.md`                                                  | this file; what a review finding is, and the questions every review answers                                                                           |
| `angular.json`, `tsconfig.json`                                           | each project's build, test and lint targets; a path per entry point, to its source                                                                    |
| `eslint.config.js`, `.stylelintrc.json`, `.prettierrc`                    | ESLint with angular-eslint, stylelint for SCSS, Prettier                                                                                              |
| `.gitleaks.toml`                                                          | the secret scan: gitleaks' own rules, and any exception with its reason                                                                               |
| `.editorconfig`, `.gitattributes`, `.gitignore`, `.git-blame-ignore-revs` | UTF-8, LF, two spaces; what git ignores; reformats blame skips                                                                                        |
| `.github/workflows/`                                                      | `ci.yml` (the full lane on Linux, the pack on Windows, the `CI` check), `pr-text.yml` (the `PR text` check), `codeql.yml`, `pages.yml` (the demo app) |
| `.github/`                                                                | `dependabot.yml`, `ISSUE_TEMPLATE/` (the bug and feature forms), `pull_request_template.md`, `CODEOWNERS`                                             |
| `scripts/link-info.js`                                                    | what `npm run dev:link` prints: how to link the built library into another app                                                                        |
| `package.json`, `package-lock.json`                                       | the npm workspace, its scripts and dev tools pinned exactly; the lock `npm ci` installs                                                               |
| `README.md`, `Add-Benton-Sans.md`, `LICENSE`                              | for users; how to add the Tableau font; AGPL-3.0                                                                                                      |
| `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`                          | what changed for apps, by release; how to report a vulnerability; a first contribution's short path                                                   |
| `.vscode/`, `.angulardoc.json`                                            | shared editor settings; the AngularDoc extension's id                                                                                                 |

## Build and test

Run from the repo root. `ng` is the repo's own CLI: `npx ng` when it is not on PATH. The same in bash and PowerShell.

| What                        | Command                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| once per clone and worktree | `npm ci`, then `npm run setup` (the hooks, `git blame` skipping reformats)                                                                  |
| the library                 | `npm run build:component-library`, into `dist/component-library`                                                                            |
| the demo app                | `ng build test-app` (prints "Prerendered N static routes"); `npm start` serves it on port 4201                                              |
| tests                       | `ng test --watch=false`: both projects, in Chromium and Firefox (`npx playwright install chromium firefox`)                                 |
| lint and format             | `ng lint`, `npm run lint:scss`; `npm run pretty` formats everything the gate's Prettier check reads                                         |
| the hooks' tests            | `npm run test:tools`                                                                                                                        |
| the gate                    | `npm run gate -- quick` (lock, ESLint, stylelint, Prettier, AGENTS.md, skills, attribution, gitleaks); `full` adds the builds and the tests |

- The quick lane runs before every push, on what the push sends. gitleaks runs when it is on PATH; without it the gate
  says it skipped, and `GATE_REQUIRE_GITLEAKS=1`, as CI sets it, makes that a failure.
- The full lane is what a PR must pass, and what `finish-work` runs.

## How a change lands

`main` takes squash-merged PRs only, and the skills in `.claude/skills/` run each step.

1. An issue on serionist/tableau-ui-angular for every change, a typo included: `start-work` finds or opens it.
2. A plan in `docs/plans/` when `docs/plans/README.md` says so, reviewed with `review-plan`, approved by the maintainer.
3. A worktree `.claude/worktrees/<issue>-<slug>` on a branch of that name from `origin/main`, with `npm ci` run in it.
4. The code, with its tests and docs in the same change.
5. `finish-work`: the full lane, `review-code` until clean, a PR whose `CI` and `PR text` checks pass, and the
   squash-merge, on the maintainer's word or under a standing approval the plan records.

## Writing

For every doc, comment, skill, commit and PR.

- Conclusion first. Per section, a one-line lead, then a small table or a few one-line bullets.
- Short sentences that name the file, the command, the number. No bold lead-in on every bullet.
- Spaced hyphens, never em dashes. Never "ensure", "robust", "comprehensive", "leverage", "seamless" or "that said".
- Plan and review ids only in `docs/plans/` and `docs/reviews/`; elsewhere, say the reason itself.
- Docs move in the same change: `README.md`, this file for a changed path, command or rule, the plan when work departs.

## Commits and PRs

PRs are squash-merged, so the PR's title and description become the commit on `main`.

- A plain imperative title that says what changed; a body that says why and ends `Refs #<n>` or `Closes #<n>`.
- No tool attribution of any kind: no AI co-author trailers, "Generated with" lines, Claude-Session lines or session links.
- That holds for commits, PR titles, PR bodies and squash messages. `commit-msg` refuses them; the gate checks the
  branch, and `PR text` the title and body.
- Dependabot's PRs skip `PR text`, since their bodies quote other projects' release notes: squash one with its title
  and a line naming what moved, never its body. Minor and patch updates merge themselves once CI passes
  (`dependabot-auto-merge.yml`); a draft holds one; majors wait for the maintainer.

## One-way doors

Consumers depend on these from 0.2.0. Change one only in a PR that says so in its title and description, after the
maintainer agrees in its issue; in 0.x a minor may break one, under CHANGELOG's Breaking.

- the npm name `tableau-ui-angular`, and its entry point paths, `tableau-ui-angular/<folder>`;
- every selector, input, output and exported symbol;
- the SCSS import paths under `tableau-ui-angular/styles`, and the theme's CSS custom properties;
- the shipped scripts' paths and arguments: `styles/fonts/downloadFonts.js`, `used-icons/scripts/update-icons.js`;
- the peer range: `@angular/*` `^22.0.0`, `rxjs` `^7.4.0`, `monaco-editor` optional.

## Traps

What this repo already paid for, and the guard.

| What broke                                                                                                             | The guard                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `{ ...getComputedStyle(el) }` copies no named property in Firefox, so every table and virtual list was empty           | Read each property by name (`style.height`); the tests run in Firefox |
| ng-packagr 22 publishes the package as `"type": "module"`, so a CommonJS shipped script threw `require is not defined` | Every shipped `.js` script is an ES module; run it from `dist/` once  |
| Angular 22 type-checks host bindings, so a `private` member one reads fails the build                                  | Members a template or host binding reads are `protected`              |
| `ng update` sees only the root `package.json`; the demo app's Angular packages are in `projects/test-app/package.json` | Move them by hand to the same versions, then `npm install`            |
| A worktree whose `node_modules` linked to another checkout's built and tested that checkout's library                  | `npm ci` in each worktree; never a link or a copy                     |

## Look up APIs first

Angular, Vitest and Playwright move faster than any model's memory: look an API up before coding against it, for the
versions in `package-lock.json`, with the Angular CLI's MCP server or Context7 (`.mcp.json`).

## Never

- Push to `main`, or merge with a failing gate.
- Weaken a test, a lint rule, a check, a hook or CI to make a change pass: no skip, no new disable, no `--no-verify`.
- Add tool attribution, or commit a secret: a token, a key, a password, an `.npmrc` with a token.
- Change a one-way door without the maintainer's agreement.
- Check out, build or run code from outside the maintainers on your machine: read it, and let CI run it.
