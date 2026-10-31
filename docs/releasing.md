# Releasing

A tag `v<version>` on a commit of `main` publishes `tableau-ui-angular` to npm with provenance and creates the GitHub
release, once you approve the `npm` deployment. `.github/workflows/release.yml` does it, with no npm token or other
secret anywhere.

## The short path

One PR, one tag, one approval.

1. A PR from `main` that bumps the version and dates the changelog:
   - `npm version 0.2.0 -w projects/component-library --no-git-tag-version` sets the one version, in
     `projects/component-library/package.json`, and `package-lock.json` with it;
   - in `CHANGELOG.md`, `## Unreleased` becomes `## 0.2.0 (2026-11-02)`, dated the day you tag, under a new empty
     `## Unreleased`;
   - `SECURITY.md`'s supported versions, and the README's, when the release changes them.
2. Merge it.
3. Tag its merge commit and push the tag. Do it at once: the run waits for `main`'s CI on that commit.

   ```sh
   git fetch origin
   gh pr view <n> --json mergeCommit -q .mergeCommit.oid
   git tag -a v0.2.0 -m "tableau-ui-angular 0.2.0" <that commit>
   git push origin v0.2.0
   ```

4. Approve the deployment: the run's page, Review deployments, `npm`, Approve and deploy.
5. Check it: `npm view tableau-ui-angular@0.2.0` prints the version, and the version's page on npmjs.com shows
   Provenance, linked to the run. The GitHub release holds the CHANGELOG section and the tarball.

A version with a pre-release part, such as `0.3.0-rc.1`, publishes under npm's `next` tag, so `npm install` keeps
the latest release, and makes a GitHub pre-release. It needs a dated section of its own too.

## What the run does

Five jobs; nothing reaches npm until the first three pass and you approve.

| Job                            | What it checks or does                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Check the tag                  | The commit is on `main`; the tag is `v` and the package's version; CHANGELOG has `## <version> (YYYY-MM-DD)` with lines under it; npm has no such version |
| CI passed on the tagged commit | A `ci.yml` run on `main` for the commit passed: a push's, the daily one or a manual one. It waits for one still running, up to 45 minutes                 |
| Build, test, pack              | The gate's full lane on the commit, then the library built and packed; the log lists the package's files; the tarball is uploaded                         |
| Publish to npm                 | In the `npm` environment, after your approval: `npm publish` of that tarball, through trusted publishing, with provenance                                 |
| GitHub release                 | The tag's release, with the CHANGELOG section as its notes and the tarball attached                                                                       |

- The checks are `tools/release.mjs`, tested in `npm run test:tools`.
- The publish job runs Node 24's own npm, which trusted publishing needs at 11.5.1 or later. It stops on an older one
  and installs nothing.

## When a step fails

Before Publish nothing is on npm, so the tag can move; after it, the version is taken for good.

| What failed                                        | What to do                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A check, the build, or you rejected the deployment | Delete the tag (`git push origin --delete v0.2.0`, `git tag -d v0.2.0`), fix `main` in a PR, and tag again                      |
| `main`'s CI on the commit, from a flaky test       | Re-run its failed jobs on its page, then the release run's failed jobs; the tag stays                                           |
| Publish, with `ENEEDAUTH` or `E404`                | The trusted publisher doesn't match the run: check its fields below, then re-run the failed jobs                                |
| The GitHub release                                 | Re-run that job; the package is on npm already                                                                                  |
| Something in the published package                 | npm never takes a version twice, even after `npm unpublish`: fix it and release the next patch. `npm deprecate` warns its users |

## One-time setup

The publish job fails until both are in place.

| Where                                                 | What                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| npmjs.com, the package's Settings, Trusted publishing | GitHub Actions: user `serionist`, repository `tableau-ui-angular`, workflow `release.yml`, environment `npm`. Each must match exactly |
| GitHub, the repo's Settings, Environments             | `npm`: the maintainer as required reviewer, self-review allowed, deployments from tags matching `v*` only. Created on 2026-10-31      |

After the first release through this workflow, on npmjs.com: the package's Settings, Publishing access, "Require
two-factor authentication and disallow tokens", then revoke any npm token left. Trusted publishing uses no token, so
releases go on.
