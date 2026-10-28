# Code review lenses

`review-code` applies these to a change or a path: in the standard tier the lenses the scope meets, in the deep tier
all of them. `REVIEW.md` holds the severities, the questions and the harness rule. A lens whose "Applies when" names
nothing in the scope returns nothing, and an empty list is a good result.

Report a problem only when it is real: it can be reproduced and fails for an app that uses the library, for its users
(keyboard and screen-reader users included), or for the next person who changes the code.

- It has a title, a severity (blocker, major, minor; most are minor), and the file and the function or line.
- The scenario: the input or state, what happens, why it matters. No scenario, no finding.
- What it is judged against: `AGENTS.md`, `REVIEW.md`, the plan, Angular's or a library's documented behaviour.
- The evidence, the line quoted, and the fix in a line. Style is Prettier's and ESLint's, taste is the author's.

Improvements under any lens: a reuse missed, a simpler approach, a step someone must remember that a check could do.
What, where, why it is better; no severity, never counted.

## plan-and-intent

Applies when: the change has a plan in `docs/plans/` or an issue.

- Does it do what they say? A planned step missing, or behaviour nobody asked for that a user meets, is a finding.
- A small departure the PR explains is not.

## implementation

Real bugs a user would hit that the lenses below don't catch.

- An empty list, `null` or `undefined`, a very long list, duplicate values, rapid input.
- A component destroyed mid-operation, two instances on one page, a value set before the view initialises.
- An error swallowed, so a failure looks like success to the app.

## forms-contract

Applies when: the scope touches a `ControlValueAccessor`, a validator, or `form/`.

- `writeValue` before init and with `null`; a programmatic write that fires `onChange` (a loop, a form dirty on load).
- Touched on blur, not on focus; `setDisabledState` honoured in the DOM.
- `compareWith` for object values; reactive and template-driven forms both.

## change-detection-and-signals

- A view that doesn't update under OnPush or in a zoneless app.
- An `effect` that writes a signal it reads; `untracked` missing or wrong; a `computed` with side effects.
- A subscription, listener, observer, timer or `requestAnimationFrame` not torn down on destroy: a leak that grows
  with each open and close.

## accessibility

Applies when: the scope touches a template, keyboard handling or focus.

- Keyboard reach and order; focus trapped and returned in dialogs, menus and drawers.
- The role and state of the widget's WAI-ARIA pattern (listbox, combobox, menu, tree, tablist, dialog), and
  `aria-expanded` and `aria-activedescendant` kept in step.
- A name for every control. Only a real failure: a keyboard user stuck, a screen reader announcing the wrong thing.

## overlays-and-dom

Applies when: the scope touches positioning, `document.body`, observers, measuring or browser globals.

- Positioning at viewport edges and inside scroll containers; z-index between overlays; a scroll lock not released;
  nodes appended to `document.body` and never removed.
- Server rendering: `window`, `document` or an observer touched while rendering or in a field initialiser crashes the
  prerender. The pattern is `inject(DOCUMENT)`, and `afterNextRender` for observers and measuring.
- Firefox: a style read by spreading `getComputedStyle()` (`AGENTS.md`, Traps).

## security

Applies when: the scope touches `innerHTML`, `bypassSecurityTrust*`, URLs or HTML built from input, the Monaco loader,
a workflow or a token.

- Name the concrete attack and what it gains.
- Script from input running in a user's session, or a token a dependency's install script can read, is a blocker.

## public-api-and-packaging

Applies when: the scope touches a `public_api.ts`, `public-api.ts`, an `ng-package.json`,
`projects/component-library/package.json`, `styles/` or a shipped script.

- A selector, input, output or export changed without being named: a one-way door (`AGENTS.md`), a blocker.
- An export a consumer needs that is missing; an entry point that imports another's internals by relative path.
- A dependency used but not declared; a peer range that doesn't match the code; a shipped `.js` script that is not an
  ES module.

## tests

- Would each new test fail without the change? Is a fix pinned by a test that reproduced the bug?
- Does it check behaviour (inputs and outputs, keyboard, the forms contract, ARIA state), in both browsers, with no
  network?
- A missing test for new behaviour is a major; a missing edge case is a minor.

## docs-freshness

- Did `README.md`, `Add-Benton-Sans.md`, the demo page, `AGENTS.md` (a changed path, command or rule) and the plan move
  with the change?
- Does anything cite a path, a command, an input or a script that no longer exists?
- A comment or doc outside `docs/plans/` and `docs/reviews/` that cites a plan or review id instead of the reason.

## simplicity

A second implementation of one thing, a layer with one caller, an option nobody asked for, dead code: an improvement,
written as what it drops ("X could become Y, which drops Z"). A finding only when it causes a real failure, such as two
copies that already disagree.

## harness-integrity

Applies when: the scope touches a harness file (`REVIEW.md`, The harness).

- A check loosened: a gate check dropped or made a skip, a lint rule or a test turned off, a question or a lens
  removed, attribution let through, a permission widened.
- A blocker unless the maintainer agrees in the PR.

## Refuting

Every finding gets a refutation attempt before it is reported.

- Not real when its scenario can't happen (read further: a parent, a base class, a pipe or the module often handles
  it), it causes no failure, it is taste, or it rests on a misread of Angular.
- Settle it with the quoted line. On your own branch a refuter may reproduce it with a test or a short script.
- Code from outside the maintainers is never run here. A refutation you couldn't check leaves the finding real; a
  refuted one stays in the record with its reason.
