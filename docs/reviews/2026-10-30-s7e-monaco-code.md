# S7e, Monaco, theme, clipboard, styles and the shipped scripts: code review

- **Subject:** S7e of #24, PR #73, branch `24-s7e-monaco`, base `main` `1a1dceb`.
- **Round 1:** 2026-10-30, two fresh reviewers, split as review-code says for a change over 1,500 lines: the library
  code (Monaco, theme, clipboard, styles) at standard tier; and the shipped scripts, `tools/`, the CI workflow, the
  demo and the docs, at deep tier for the scripts, tools and CI, with probes against local servers. At `085cc24`.
  Verdict: **clean**, no blocker or major; five minors, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes, the Windows leg running both scripts from the
  packed tarball; the full lane locally and in a clean clone outside the main checkout (no zone.js), with 26
  prerendered routes and the coverage floor.

## Round 1

| #   | Sev   | Where                                                   | Finding                                                                                                                                                                                                    | Status                                                                                                                                                                                                           |
| --- | ----- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | minor | the Monaco loader                                       | A failed `editor.main` load was never retried: Monaco's loader keeps the module as failed, so every later editor reported the same error and stayed blank until a reload, though the docs promised a retry | fixed: after a failed `editor.main`, the editor resets the loader it installed, so the next editor loads it again; an app's own loader is left alone; checked against Monaco's own loader in both browsers       |
| L2  | minor | the Monaco loader's XHR branch (Electron or NW.js only) | Rejecting any status outside 2xx would reject a loader read from a `file:` URL, which Chromium's XHR reports as status 0                                                                                   | fixed: status 0 is accepted; not confirmed in Electron                                                                                                                                                           |
| S1  | minor | the icons demo page                                     | It still said to install `axios`, which the script no longer uses, and didn't name `TABLEAU_UI_ICONS_CSS_URL`                                                                                              | fixed                                                                                                                                                                                                            |
| S2  | minor | the icon script, CHANGELOG                              | Node's `fetch` doesn't read `HTTP(S)_PROXY` as axios did, so an app behind a proxy now fails; CHANGELOG listed the move only under Fixed                                                                   | fixed: a Breaking line says to set `NODE_USE_ENV_PROXY=1` beside `HTTPS_PROXY`, or use a mirror; a probe confirmed the switch sends `fetch` through the proxy on Node 22.23 and 24.21; the icons page repeats it |
| S3  | minor | `downloadFonts.js`                                      | On a re-run, a broken answer deleted a font the folder already had                                                                                                                                         | fixed: each file downloads to a `.part` and is renamed on success                                                                                                                                                |

| Improvement                                                   | Answer |
| ------------------------------------------------------------- | ------ |
| Keep the undo history across an options rebuild               | taken  |
| Theme spec: light after dark, and the new storage key winning | taken  |
| Pin F2's undo half                                            | taken  |
| An explicit timeout on the spec that loads all of Monaco      | taken  |
| `domReadOnly` on a disabled editor, for screen readers        | taken  |
| Negative tests for the CI leg's script checkers               | taken  |
| "The tools' tests" in `ci.yml` and the gate                   | taken  |
| The typescript-message test checks its own precondition       | taken  |
| `pages.yml`'s fallback comment and the plan's GitHub sentence | taken  |

## Refuted

The write flag sticking or swallowing a real edit; two editors on one URI; F2 and F119 still holding; two editors
loading at once; destroy during a load; the retry after a loader script failure; an older stored theme; dark mode
toggled at runtime; SSR in Monaco, theme and clipboard; F131 backfiring; the clipboard without `navigator.permissions`;
`providedIn: 'root'` being breaking; a disabled editor trapping a user; the Breaking lines; every test failing without
its fix; the spec order; the Windows leg passing on a failing script; the scripts running from the repo instead of the
tarball; a committed private key (keys are made at each run); the test certificates; path traversal from server data;
`fetch` accepting something unsafe; an `http://` font server; a partial file surviving on Windows; F139-F143 touched
(only column padding); the 26 routes; AGENTS.md (139 lines).
