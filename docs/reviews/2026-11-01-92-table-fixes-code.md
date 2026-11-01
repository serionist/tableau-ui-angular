# #92, #96, #71, #70, the table's widths, padded rows and a failed load: code review

- **Subject:** issues #92, #96, #71 and #70 under #101, PR #102, branch `92-table-fixes`, base `main` `d5afaf1`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier, at `d26a46d`, by reading: as the maintainer set for this
  release, heavy test runs wait for #101's final pass, and CI ran the full lane on the head. Verdict: **clean**, no
  blocker or major; one minor, fixed in the same round.
- **Checks:** every check on the PR green before and after the fix.

## Round 1

| #   | Sev   | Where                                | Finding                                                                                                                                                                                             | Status                                                                                                                                                       |
| --- | ----- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | minor | `virtualize.component.scss`, `.item` | Forcing `content-box` on a virtual list's row made an item template's root inherit it under an inherit-form reset, so a root with `width: 100%` and padding grew wider than the row and was clipped | fixed: the row is `border-box`, drawn at the counted height less its margins, so its content keeps the app's box sizing; a spec under the inherit-form reset |

| Improvement                                                       | Answer                              |
| ----------------------------------------------------------------- | ----------------------------------- |
| The #71 CHANGELOG line says how to keep a padded row's old height | taken                               |
| A spec for fixed columns wider than the table                     | taken, with a spec in both browsers |

## Refuted

`contain: inline-size` and the sticky header, pinned columns, scroll syncing, a shrink-to-fit or flex parent, fixed
columns wider than the table, and Firefox; the last resizer over a sort icon; `.row { min-width: 100% }` with
selection, striping and pinned-right cells; a padded row's height after a font change; Fixed rather than Changed or
Breaking; a plain `* { box-sizing: border-box }` reset; the measuring element's box sizing; a swallowed incremental
error; the error still reaching the app and a retry; stray rejections; an aborted full load's blocks; `ReportedError` in
the public API (not exported, no API diff); the specs (each fails without its fix on its own numbers); the dashboard at
both widths; the virtualize page's text; the input docs' defaults; the four Fixed lines.
