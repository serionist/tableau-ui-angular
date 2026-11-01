# A4, tooltips (#60): code review

- **Subject:** step A4 of `docs/plans/2026-11-01-accessibility.md`, issue #60 under #101, PR #117, branch `60-tooltips`,
  base `main` `de955b9`.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the accessibility and overlays lenses in depth, at
  `1ffa012`, by reading and with three small Playwright pages in Chromium and Firefox that ran no repo code. Verdict:
  **clean**, no blocker or major; seven minors, fixed.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                           | Finding                                                                                                                            | Status                                                                                                                                          |
| --- | ----- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | minor | `onEscape`                      | A tooltip held by focus on a select, an autocomplete or a menu trigger took the first Escape while the list it opened sat above it | fixed: the tooltip yields when a dialog that closes on Escape sits above it; a spec with a select                                               |
| F2  | minor | the focus rule, the docs        | A click into a text input matches `:focus-visible`, so its tooltip opened on the click and stayed while the field had focus        | fixed: focus that follows a press on the element is ignored; the docs say keyboard focus keeps a tooltip when the pointer leaves                |
| F3  | minor | CHANGELOG, the plan             | The tooltip taking the pointer changes what a click reaches, and was only under Fixed                                              | fixed: under Breaking with how to move over                                                                                                     |
| F4  | minor | `tooltipArgsChanged`            | A tooltip rebuilt while the pointer rested on the old box, with nothing holding it, stayed                                         | fixed: it hides after the grace unless held                                                                                                     |
| F5  | minor | `onEscape`, the position clamps | A tooltip clamped onto its own element showed again after Escape, from the still pointer's `mouseenter`, so every Escape was taken | fixed: a dismissed tooltip waits for the pointer to leave or for focus                                                                          |
| F6  | minor | the spec                        | Keyboard focus holding a tooltip while the pointer passes had no test                                                              | fixed                                                                                                                                           |
| F7  | minor | `hideSoon`, the margin          | 100 ms was too short for a slow pointer to cross the margin to the tooltip (WCAG 1.4.13)                                           | fixed: the tooltip holds while the pointer moves in the band between it and its element, however slowly; a spec crosses a 2em margin at 50 px/s |

| Improvement                                                                                               | Answer                                                         |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Describe only when the container was found; a comment where the dialog sets the element the tooltip reads | taken                                                          |
| Reset the listener, description and ref on the tooltip ref's `closed$`                                    | taken                                                          |
| The dashboard's pin buttons' tooltips to the left                                                         | taken, each pin's to its own side, so neither covers the other |
| Pin the listener's removal on destroy                                                                     | taken                                                          |
| The PR body says the test library computes the description                                                | taken                                                          |

Also fixed on the way: the same-name check follows `aria-labelledby` inside the element, so a chip's remove button, named
"Remove Berlin" through its icon since #112, gets no duplicate description from its tooltip.

## Refuted

An opener's tooltip under a modal, menu or list taking the overlay's Escape (a backdrop fires `mouseleave`);
`stopPropagation()` over `stopImmediatePropagation()`; A9b's planned listener handling the key twice; the same-name
check's differences from the browser (each adds a harmless repeat); the description set before the text renders; the
dialog element read across entry points breaking silently (the specs would fail); server rendering; leaks; the specs'
added waits; a tooltip blocking clicks in dense lists (R8); the F77 test; the API file.
