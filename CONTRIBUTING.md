# Contributing

Thanks for helping. This is the short path for a first contribution; [AGENTS.md](AGENTS.md) has the full rules, for
people and agents alike, and [REVIEW.md](REVIEW.md) what a review checks.

## Before you start

- Open an issue for every change, a typo included, with the bug or the feature form, and say there that you want to
  work on it.
- Write a plan first for a non-trivial change, such as a new component or a change across entry points: the template
  and when one is needed are in [docs/plans/README.md](docs/plans/README.md). Open it as a draft PR titled
  `Plan: <title>`; the maintainer approves it before any code.
- Leave the one-way doors alone unless the maintainer agrees in the issue first: the package name and entry points,
  every selector, input, output and export, the SCSS paths, the shipped scripts, the peer range (AGENTS.md, One-way
  doors).
- Report a security issue privately, never in an issue: see [SECURITY.md](SECURITY.md).
- Opening a pull request means you license your contribution under the repository's licence, AGPL-3.0 today
  ([LICENSE](LICENSE)), and under MIT, which the project means to move to.

## Build and test

You need Node `^22.22.3 || ^24.15.0 || >=26.0.0`, git, and [gitleaks](https://github.com/gitleaks/gitleaks) for the
secret scan.

```
npm ci
npm run setup
npx playwright install chromium firefox
npm run gate -- full
```

- `npm run setup` turns on the git hooks once per clone: `commit-msg` refuses tool attribution, `pre-push` runs the
  gate's quick lane. It is safe to run again.
- `npm run gate -- full` runs lint, format, the harness checks, the attribution and secret checks, then the library
  build, the component tests in Chromium and Firefox and the demo app's build. Without gitleaks it skips the secret
  scan and says so; CI runs it.
- `npm start` serves the demo app on port 4201, rebuilding the library as you edit.

## Open the pull request

1. Fork, and branch from `main` as `<issue>-<slug>`, such as `42-select-keyboard`.
2. Make the change with its tests and docs: a behaviour test that fails without it, the component's demo page,
   `README.md`, a line in [CHANGELOG.md](CHANGELOG.md) when apps notice it, AGENTS.md when a path, a command or a rule
   changes.
3. Commit with a plain imperative subject that says what changed, and a body that says why. No AI co-author
   trailers, "Generated with" lines or session links: `commit-msg` refuses them.
4. Open the PR with [the template](.github/pull_request_template.md) filled in, ending `Closes #<issue>`, or
   `Refs #<issue>` for one step of it. Its title becomes the commit on `main`.

CI runs the full lane on Linux on Node 22 and 24 and builds and packs the package on Windows, CodeQL scans the code,
and `PR text` reads the title and description whenever they change: no attribution, and a line that names the issue.
The maintainer reviews a PR from outside by reading it, and never checks it out, builds or runs it on their machine.
Your PR is ready for review when CI is green; the maintainer squash-merges it.
