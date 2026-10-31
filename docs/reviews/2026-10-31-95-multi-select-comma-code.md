# #95, a multi select's comma: code review

- **Subject:** issue #95, PR #100, branch `95-multi-select-comma`, base `main` `0831544`.
- **Round 1:** 2026-10-31, a fresh reviewer, standard tier, at `3f60f9a`, measuring the old and new layouts with
  Playwright in Chromium and Firefox. Verdict: **clean**, no blocker or major; one minor, fixed in the same round.
- **Checks:** every check on the PR green before and after the fix.

## Round 1

| #   | Sev   | Where                               | Finding                                                                                                                                                                                                             | Status                                                                                   |
| --- | ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| F1  | minor | `common/src/option.html`, CHANGELOG | The text's leading space had widened the gap between an option's icon and its text in a select's shown value, 7.6px against the dropdown's 4px; the change narrows it, and neither the CHANGELOG nor the PR said so | fixed: kept, since it now matches the dropdown, and the CHANGELOG line and the PR say it |

| Improvement                                                             | Answer |
| ----------------------------------------------------------------------- | ------ |
| Drop the unused `separator` class, which an app's global rule could hit | taken  |
| The PR's One-way doors wording: CSS can't select a text node            | taken  |

## Refuted

Whitespace coming back between, before or after the values; wrapping (a line still breaks after the comma, no longer
before it); truncate mode; the grid layout in dropdowns, the list, the radio group and the button toggle; CSS selectors
in the library or the docs site; template options (unchanged, and two now read "Pear, Apple"); "N items selected"; the
test (it fails on the old code and on either half of the fix); other specs (each trims); the API file; Breaking (DOM
structure isn't a one-way door); accessibility and the prerender.
