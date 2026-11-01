# A1, the error colour's contrast (#97): code review

- **Subject:** step A1 of `docs/plans/2026-11-01-accessibility.md`, issue #97 under #101, PR #111, branch
  `97-theme-colours`, base `main` `1c85ad0`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the accessibility lens in depth, at `bebd559`, by
  reading and by working out each pair's contrast with WCAG's formula: as the maintainer set for this release, heavy
  test runs wait for #101's final pass, and CI ran the full lane on the head. Verdict: **clean**, no blocker or major;
  one minor, fixed.
- **Checks:** every check on the PR green before and after the fix.

## Round 1

| #   | Sev   | Where                       | Finding                                                                                                                                                                                           | Status                                                                              |
| --- | ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| F1  | minor | CHANGELOG, the theming page | An app's own light text on the error colour drops below 4.5:1 on the new dark red, and an app that sets the colour itself gets a near-black raised label; neither text said what such an app does | fixed: both say text on `--twc-color-error` takes `--twc-color-base`, kept at 4.5:1 |

| Improvement                                         | Answer                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Pin the error buttons' hover pairs                  | taken                                                                                           |
| One list of pairs for the spec and the theming page | taken: `testing/contrast-pairs.ts`, which a second test checks against what the components draw |
| A touched invalid input shows no focus              | a separate issue, #114, taken into A2                                                           |
| A failed block's pill reads only by a faint colour  | a separate issue, #115, for A7a                                                                 |

## Refuted

Error text at 4.5:1 on every surface the library draws it on (base, highlights, a selected row, the keyboard
highlight, a modal's header, the menu's selected background); non-text parts at 3:1 (borders, the snack's icon and
timer, the resizer, the dashboard's bars); light text on the red elsewhere in the library (none); the raised label at
rest, under the pointer, disabled and focused; the spec being vacuous (an opaque check, two reds, and a revert fails
it); the `styleUrl` pattern; the coverage floor; the CHANGELOG's "raised" wording; the plan's progress log; the
theming page's claims; the one-way doors (no name changed).
