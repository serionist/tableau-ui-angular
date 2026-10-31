# #90, the docs site's code coloured with Monaco: code review

- **Subject:** issue #90, PR #93, branch `90-docs-highlight`, base `main` `f8f8488`.
- **Round 1:** 2026-10-31, a fresh reviewer, standard tier with the security lens, at `613b4ea`. The change adds a Monaco
  loader to the docs site, which review-code lists under the deep tier; the security lens found nothing (the URL is a
  constant under the base href, and no HTML is built from a sample's text). The reviewer probed the loader, a failed
  load and the second-loader race in headless Chromium, and computed every colour's contrast. Verdict: **clean**, no
  blocker or major; two minors, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes; the full lane in a clean clone.

## Round 1

| #   | Sev   | Where                                                           | Finding                                                                                                                                                                       | Status                                                                                                             |
| --- | ----- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| F1  | minor | `docs-monaco.service.ts`                                        | After a failed `editor.main` load the AMD loader kept the failure, and the Monaco page's editors, which don't reset a loader they didn't install, stayed empty until a reload | fixed: the docs reset the loader they installed after a failure; a test fails the first load and loads on the next |
| F2  | minor | `docs-code.component.spec.ts`, `docs-example.component.spec.ts` | The waits allowed 20 s inside Vitest's 15 s browser-mode test timeout, so the longer wait could never take effect                                                             | fixed: the specs that wait for Monaco have a 30 s timeout                                                          |

| Improvement                                                                                            | Answer                                                         |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Close the second-`loader.js` race in the docs site with a queueing `require` stub                      | taken, with a test                                             |
| Command blocks colour once Monaco is there but don't load it, so `/` doesn't fetch 3.9 MB for one line | taken, a departure from the issue's wording recorded in the PR |
| The "plain further down" test waits for the observer to answer before asserting                        | taken                                                          |

## Refuted

HTML injection from a sample's text (runs render as text nodes); the text altered (runs must join back to the source);
hidden tabs, later blocks and theme switches; code on the server; leaks (observer, JSON model, no worker); a second
`loader.js` when landing on `/monaco/` directly; the race as a finding (tens of milliseconds, nothing visible); contrast
(every colour 4.57:1 or more in both modes); the contrast spec being vacuous; the AMD `define` global and Monaco's CSS
touching the site; theme state leaking between specs; the labels test missing blocks; the PR text.
