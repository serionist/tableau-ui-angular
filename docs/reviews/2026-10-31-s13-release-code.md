# S13, the release workflow: code review

- **Subject:** the first half of S13 of #24, PR #88, branch `24-s13-release`, base `main` `aed7287`.
- **Round 1:** 2026-10-31, a fresh reviewer, deep tier with every lens, at `46f8bd1`, read only. It ran
  `tools/release.mjs ci` against the real Actions API, `npm view` against the real registry, the docs' `npm version`
  command on a copy of the manifests, and a dry-run publish against a stub registry; it checked each pinned action
  against its tag, the `npm` environment and the repo's secrets through the API, and the model workflow's successful
  run with the same actions. Verdict: **clean**, no blocker or major; one minor, fixed in the same round.
- **Checks:** every check on the PR green before and after the fix; the full lane in a clean clone on `46f8bd1`.

## Round 1

| #   | Sev   | Where                                  | Finding                                                                                                                                                                                                                                                                 | Status                                                                                                                                                                                                                                                                       |
| --- | ----- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | `docs/releasing.md`, When a step fails | Its first row sent every failure before Publish to "delete the tag, fix `main`, tag again", so a registry timeout, a flaky test, a CI wait that ran out, or a commit with no `ci.yml` push run led to an empty PR, and the tool's own message said to run the job again | fixed: the row covers a check that names a problem in the commit or a rejected deployment; a row says to re-run the failed jobs for the transient cases; a row says to tag the version PR's merge commit when the commit has no `ci.yml` run, as a Dependabot merge has none |

| Improvement                                                                                                     | Answer |
| --------------------------------------------------------------------------------------------------------------- | ------ |
| AGENTS.md's tools' tests row names the release checks                                                           | taken  |
| AGENTS.md's docs row says `docs/releasing.md` is the current runbook, not a dated record                        | taken  |
| The runbook and the plan check provenance with `npm view tableau-ui-angular@0.2.0 dist.attestations.provenance` | taken  |

## Refuted

The CI lookup for an annotated tag (`GITHUB_SHA` is the commit); `origin/main` missing for the ancestry check
(`fetch-depth: 0`); the CI lookup counting a pull request's, another branch's or another commit's run, or missing a
re-run; `repository.url` and provenance; setup-node's `registry-url` against OIDC; npm older than 11.5.1; publishing a
tarball by its bare file name; the artifact hand-off and a re-run's artifacts; the action pins; `npm view` and a past
0.2.0 (never published); script injection from the tag, the version or CHANGELOG; least privilege, secrets (none) and
the environment's reviewer and tag rule; two publishes; the docs' `npm version` command; the pre-push hook on a tag
push; the full lane on a detached tag checkout; an empty bash array under `set -u`; the notes' size and mentions; the
tarball's contents and licence; the tests (each check has one that fails without it); AGENTS.md (149 lines, its rows
true); a rate-limited API (stops with a clear message).
