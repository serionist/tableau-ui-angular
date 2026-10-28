# Plan review lenses

`review-plan` applies the lenses below that the plan touches; in the deep tier, all of them. `REVIEW.md` holds the
severities, the questions and the harness rule. A lens that names nothing in the plan returns nothing, and an empty
list is a good result.

A finding on a plan is a defect that would really hurt if the plan were followed as written. It has:

- a title, a severity (blocker, major, minor; most are minor) and the plan section;
- the scenario: what goes wrong when the plan is followed as written. No scenario, no finding;
- what it is judged against: a rule in `AGENTS.md` or `REVIEW.md`, the code, a library's documented behaviour;
- the evidence, the plan quoted, and the plan edit that fixes it.

Improvements under any lens: what would make the plan, or the code it leads to, simpler, safer or cheaper to change.
No severity, never counted. Mechanical over manual: a step someone must remember, which a check could do.

## plan-and-intent

Does the plan do what its issue asks, and nothing nobody asked for?

- Does it contradict a rule in `AGENTS.md` or `REVIEW.md`?
- Does it change a one-way door without naming it under Compatibility? Named, it is the maintainer's call; silent,
  a blocker.

## omissions

What `REVIEW.md` and the code require that the plan leaves out, and that would bite.

- The other places a change reaches: the entry point's `public_api.ts`, the demo page, the styles, the shipped scripts.
- A CHANGELOG line consumers need, and how existing apps move over.

## consumers

Applies when: the plan changes a selector, input, output, export, entry point, style path, CSS custom property,
shipped script or peer.

- Is each change named under Compatibility, with how an app moves over and a Breaking line?
- Does it hold for an Angular 22 app that is zoneless, server-rendered, or imports one entry point only?

## forms-and-accessibility

Applies when: the plan touches a form control, an overlay, focus or keyboard handling.

- Does the design keep the forms contract (`REVIEW.md`, question 4) and the WAI-ARIA pattern the widget needs?
- Does it say which test shows it, in both browsers?

## ssr-and-browsers

Applies when: the plan touches the DOM, observers, measuring, timers or styles read at runtime.

- Does rendering stay free of `window` and `document`, so the demo app still prerenders?
- Does it hold in Firefox, where this repo broke before (`AGENTS.md`, Traps)?

## security-and-ci

Applies when: the plan touches HTML or URLs built from input, the Monaco loader, a workflow, a token or publishing.

- Name the attack and what it gains. Script from input in a user's session is a blocker.
- Does every token stay out of reach of a dependency's install script, and does the design fail closed?

## sequencing-and-tests

- Can each step be built, tested and merged on its own, in that order?
- Does each step name the test that proves it, one that fails without the change?
- Can that test run in CI: no network, no Tableau Server, no browser beyond Playwright's Chromium and Firefox?

## simplicity

A seam with no caller, a setting nobody asked for, a second way of doing one thing, scope beyond the issue: an
improvement, written as what it drops and who would notice. A finding only when following the plan causes a real
failure.

## harness-integrity

Applies when: the plan touches a harness file (`REVIEW.md`, The harness).

- Does it loosen a check, a hook, the gate or the agent setup? A blocker unless the plan says so and the maintainer
  agrees.

## premortem

Assume the plan shipped and an app broke on upgrade, or the demo stopped building: what was the likeliest cause, and
what plan edit prevents it? Report it only when the plan's text makes the cause plausible.

## Refuting

Every finding gets a refutation attempt before it is reported.

- Not real when the plan covers it elsewhere (read the whole plan: the usual false positive), it is deferred openly
  under Later or Out of scope, it is taste, or it rests on a misread rule or code.
- Quote the plan and the rule or code; a refutation without quoted text leaves the finding real.
- A refuted one stays in the record with its reason; if its edit would still make the plan simpler, list it as an
  improvement too.
