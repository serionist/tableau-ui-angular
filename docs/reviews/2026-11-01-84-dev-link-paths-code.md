# #84, the dev:link steps: code review

- **Subject:** issue #84 under #101, PR #105, branch `84-dev-link-paths`, base `main` `d5afaf1`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier, at `fb7f457`, by reading the installed `@angular/build`
  22.2.5, TypeScript 6.0.3, ng-packagr 22.2.5, the Angular 22 tsconfig template and a built `dist/component-library`.
  Verdict: **clean**, no blocker or major; one minor in the PR text, fixed.
- **Checks:** every check on the PR green.

## Round 1

| #   | Sev   | Where       | Finding                                                                                                                                                                                                                                                                                                                   | Status                                            |
| --- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| F1  | minor | the PR text | It said a `tableau-ui-angular/*` mapping resolves nothing because the build has no folder per entry point; ng-packagr writes `<folder>/package.json` in every build, leaving it out of the tarball only, so the mapping resolves the same files as `exports` and adds nothing. The watcher note didn't match `watcher.js` | fixed: the text says so; dropping the step stands |

## Refuted

No `paths` entry needed for an Angular 22 app (bundler resolution reads `exports`); esbuild; `preserveSymlinks` either
way; `ng serve` rebuilds; `ng test`; an app on `moduleResolution: node`; the script, page and spec (the spec fails
without the change); no CHANGELOG line (the script isn't shipped).
