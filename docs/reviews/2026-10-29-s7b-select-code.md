# S7b, the select group's fixes: code review

- **Subject:** S7b of #24, PR #56, branch `24-s7b-select`, base `main` `1762a43`.
- **Round 1:** 2026-10-29, two fresh reviewers, split as review-code says for a change over 1,500 lines: the chip
  control, the date picker and the docs; and the select, autocomplete, menus, prerender routes and coverage floor.
  Standard tier, at `2a8c343`. Verdict: **clean**, no blocker or major; eleven minors, fixed in the same round.
- **Checks:** every check on the PR green before and after the fixes; the full lane locally, with the component tests
  in Chromium and Firefox, eight prerendered routes and the coverage floor.

## Round 1

| #   | Sev   | Where                                          | Finding                                                                                                                                               | Status                                                                                                    |
| --- | ----- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A1  | minor | chip control                                   | Values bound with data on the first render, before any keys, were overwritten with `[]`, since the chips effect ran before the values one             | fixed, with a test                                                                                        |
| A2  | minor | chip control                                   | Values setting the keys dropped keys still being looked up, so chips added by key during a slow lookup never appeared                                 | fixed: keys still requested are kept, with a test                                                         |
| A3  | minor | date picker                                    | A regression: after a partly typed date, `reset()` left the typed segments on screen while the form was null                                          | fixed: `writeValue` always writes the element; only the value the input just produced is skipped          |
| A4  | minor | CHANGELOG                                      | The removed public `DatePickerDirective.onFocus()` had no Breaking line                                                                               | fixed                                                                                                     |
| A5  | minor | CHANGELOG                                      | The local-midnight line didn't say that dates to compare with, such as validator bounds, must be built as local dates in every zone                   | fixed                                                                                                     |
| B1  | minor | select                                         | Closing the dropdown with focus inside it (a search box, then Escape, Enter or a click) dropped focus to the page and never marked the select touched | fixed: focus returns to the select, as the combobox pattern does                                          |
| B2  | minor | select, autocomplete, menu; the dialog service | The dropdown repositioned on resize, not on scroll, though CHANGELOG said it followed scrolling                                                       | fixed: overlays reposition on a passive, capture-phase scroll listener while open (in the dialog service) |
| B3  | minor | menu-button group                              | A standalone group on a server-rendered page measured itself on teardown and crashed the render                                                       | fixed, with a server test that destroys the fixture                                                       |
| B4  | minor | menu-button group                              | A submenu item that got DOM focus, as a screen reader moves it, was removed by the group's focusout before it could run                               | fixed: focus moving within the group closes nothing                                                       |
| B5  | minor | autocomplete                                   | The listbox was unnamed under a plain `<label for>` without an id                                                                                     | fixed: the label's text names it                                                                          |
| B6  | minor | autocomplete spec                              | Removing the directive's unsubscribe still passed the F44 test                                                                                        | fixed: the test checks the subscription is released                                                       |

| Improvement                                                        | Answer |
| ------------------------------------------------------------------ | ------ |
| The F36 test's second half couldn't fail                           | taken  |
| CHANGELOG wording for the chip control's removals                  | taken  |
| `[keys]` and `[values]` leave a bound form pristine: a test        | taken  |
| The autocomplete resets its highlight on open, as the select does  | taken  |
| A loading menu item doesn't highlight or open its submenu on hover | taken  |
| Focus returns to the select after the clear button                 | taken  |

Found while fixing the round, and fixed with it:

- Keys and values set together started a lookup whose answer would later replace the app's chip; the keys effect now
  waits for that values write.
- Firefox failed four menu tests in CI: a select test clicking through `userEvent` left the real pointer where the menu
  then opened, and Firefox hovers the item under a still pointer when the layout changes. The overlay specs now move
  the pointer away first (`projects/component-library/testing/pointer.ts`). Chasing it also gave menu items that load
  while the menu has focus their first highlight, which is kept.
- One local full lane failed the demo build once in 6.5 seconds with no message; `ng build test-app` alone and the
  rerun passed, and CI never failed it. No cause found; noted here in case it returns.

## Refuted

The chips and values effects looping (stopped by reference); a key removed and re-added during a lookup; a failed
lookup leaving the spinner or stopping the chain; the control changing the app's arrays (it copies); a chip click
marking touched early (focus returns to the input); the chip input unnamed inside a form field (named since S7a); the
date picker reading `type` too early; the timezone test on a UTC runner (Chromium runs it in New York); the effect
clearing a date being typed; a disabled select marked touched (it takes no pointer events); `aria-activedescendant`
outside the combobox (allowed for the popup it controls); nested menus (the APG menubar nests them); the item's
`aria-expanded` fighting the group; two keydown handlers acting (the host stops propagation); a closed output on
destroy; a click-through after the backdrop goes; SSR in the select, autocomplete and menu (globals only in
handlers); a window blur closing the select.
