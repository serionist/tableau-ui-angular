# S11, the repo's presentation: code review

- **Subject:** S11 of #24, PR #98, branch `24-s11-presentation`, base `main` `0831544`.
- **Round 1:** 2026-10-31, a fresh reviewer, standard tier (AGENTS.md changes one cell), at `4971970`. It rendered the
  README through GitHub's renderer, fetched the badges, measured the logo's contrast, read the font's licence, and
  checked which favicon Chromium and Firefox keep on a served build. Verdict: **clean**, no blocker or major; three
  minors, all fixed.
- **Checks:** every check on the PR green before and after the fixes; the full lane in a clean clone on `de25edb`.

## Round 1

| #   | Sev   | Where                                     | Finding                                                                                                               | Status                                                                           |
| --- | ----- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| F1  | minor | `index.html`, the favicon links           | Chromium kept the `.ico`, whose `sizes` named 16, 32 and 48, over `mark.svg`, so a dark browser showed the light icon | fixed: the link says `sizes="32x32"`; Chromium and Firefox now take the SVG      |
| F2  | minor | the README's caption, the plan            | The caption linked the docs site's root, since the dashboard page wasn't merged                                       | fixed: after #94 merged, it links `/dashboard`, which answers 200                |
| F3  | minor | the README's pictures, the social preview | They showed the multi select's "North , East" (#95)                                                                   | fixed: after #100 fixed it and #94 merged, the pictures were retaken from `main` |

| Improvement                                             | Answer |
| ------------------------------------------------------- | ------ |
| End the card's crop on a whole row                      | taken  |
| A larger not-affiliated line, legible in a 500px unfurl | taken  |
| The PR's Review section names the round                 | taken  |

## Refuted

The README's image URLs; `<picture>` on GitHub (themed) and on npm (the light fallback); the badges (npm 0.2.0, CI,
licence MIT, downloads, docs); the README's checked example, unchanged; the logo's originality and its 16px frame;
Roboto's licence (a wordmark drawn with the font ships no font program); the marks' contrast; the `angular.json` glob
(only `mark.svg` is served); the header in both themes and closed; the tests (each fails when its subject breaks); the
`?bytes` import; the screenshots' numbers; AGENTS.md (149 lines); attribution.
