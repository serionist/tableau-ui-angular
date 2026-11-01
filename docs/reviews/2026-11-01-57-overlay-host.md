# A9a, the overlay host: code review

- **Subject:** step A9a of `docs/plans/2026-11-01-accessibility.md`, which prepares #57 under #101, PR #123, branch
  `57-overlay-host`, base `main` `72dc0b8`, with `main` merged in after #113, #120, #124, #122 and #118.
- **Round 1:** 2026-11-01, a fresh reviewer, standard tier with the overlays-and-dom, public API,
  change-detection-and-signals and accessibility lenses in depth, at `a5b2b5f`, by reading and with Playwright pages
  that copied the PR's DOM in Chromium and Firefox. Verdict: **not clean**, one major and two minors. A fresh refuter
  confirmed the major and replaced its proposed fix. One of the PR's decided calls was reversed.
- **Round 2:** 2026-11-01, a fresh reviewer, standard tier with the overlays-and-dom, change-detection-and-signals
  and public API lenses in depth, at `9406298`, on round 1's fixes, with a Playwright page that compiled the shipped
  dialog and snack styles, in Chromium and Firefox. Verdict: **clean**, no blocker or major; five minors, fixed or recorded at `d6d6ea6`.
- **Checks:** every check on the PR green before and after the fixes.

## Round 1

| #   | Sev   | Where                                                | Finding                                                                                                                                                                                                                                                                                                      | Status                                                                                                                                                                                                                                                                                                      |
| --- | ----- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | major | `_openDialog`, `createBackdrop`, `.dialog-container` | Overlays hosted in a modal's container compete with its content's own z-indexes: with a map's panes at 400 or a sticky toolbar at 1000 in the content, a tooltip and a confirmation's OK button were under them and the map took the click, in both browsers, where on `main` they sat above the whole modal | fixed at `71ff26c`: each modal's container ends with an overlay layer, fixed, of no size, at the top of its stacking order, and `$overlayHost()` returns it; specs put a map at 400 with a transform and a sticky toolbar at 1000 in the content, and a two-root template modal's list over its Save button |
| F2  | minor | the close handler, `DialogRef.close`                 | A dialog whose own close closes its host again, as an app's `closed$` subscriber can, ran the host's cleanup twice, and `splice(-1, 1)` took the modal below off the stack: Escape no longer closed it and `$overlayHost()` was `null` while it showed                                                       | fixed at `cd03b56`: a dialog's close runs once, and both lists skip an index of -1; a spec                                                                                                                                                                                                                  |
| F3  | minor | the spec                                             | No spec pinned that every dialog, not only a modal, closes the dialogs inside it first                                                                                                                                                                                                                       | fixed: a spec                                                                                                                                                                                                                                                                                               |

The refuter confirmed F1 with the library's compiled styles and the DOM `_openDialog` builds, in both browsers, and
rejected the reviewer's fix, `isolation: isolate` on the content's roots: it put a select's list under a later root of
a multi-root template modal, and missed a root with its own z-index. The fix taken is the refuter's: one overlay layer
per modal, fixed, of no size, at the top of the container's stacking order.

| Improvement                                                                                                                                                               | Answer                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A modal opened from a modal needn't nest in the one below: the top layer stacks sibling `<dialog>`s, and nesting closed a wizard's next modal with the one that opened it | taken: the PR's decided call reversed; a modal opened from a modal stays in the body, as on `main`                    |
| A spec that a snack outside a small modal's box isn't clipped                                                                                                             | taken                                                                                                                 |
| The notes for A9b: `cancel` and `close` don't bubble; anything A9b adds to the `<dialog>` must stay out of the hand-on                                                    | taken: in the plan's progress log and the PR body; only the layer's children are handed on, and modals no longer nest |

## Round 2

| #   | Sev   | Where                                      | Finding                                                                                                                                                                                                              | Status                                                                                                                                                                                                    |
| --- | ----- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F4  | minor | the snack service, the plan, the PR body   | While modals are `<div>`s, a snack over a modal sits at the modal's level, so an app's fixed header at z-index 1000 covers it, where in the body at 2000 it sat above; A9b's top layer cures it, in the same release | recorded at `d6d6ea6`: a decided row says so, and that keeping the stacks in the body or a Breaking line would be needed if A9b fell back; the plan and the PR body no longer say nothing visible changes |
| F5  | minor | the `$overlayHost` JSDoc, the dialogs page | An app's own overlay placed `position: absolute` with page coordinates in the 0×0 fixed layer lands low by the page's scroll, and a percentage width is of nothing; the advice didn't say to place it fixed          | fixed: the JSDoc and the page say to place it fixed, at viewport coordinates                                                                                                                              |
| F6  | minor | the specs                                  | The specs copied the layer's rule by hand, so dropping the shipped rule kept every spec green                                                                                                                        | fixed: the specs load the library's shipped styles                                                                                                                                                        |
| F7  | minor | CHANGELOG                                  | No Fixed line for two fixes apps notice: a dialog closing the lists and menus open in it, and a `close()` during a close doing nothing                                                                               | fixed: one Fixed line names both                                                                                                                                                                          |
| F8  | minor | the PR body                                | A table row missing a cell divider, and two statements of one fact                                                                                                                                                   | fixed                                                                                                                                                                                                     |

| Improvement                                                                                                    | Answer                                           |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| The plan's A9b backdrop row still names a nested modal's backdrop, and its overlay host row the container      | taken                                            |
| A9b's focus return when a modal closes under another, as a wizard does, mustn't move focus behind the open one | taken: a note for A9b in the plan's progress log |
| #101's hand check: an error snack moved into a modal and back isn't announced again                            | taken: on #101's final pass list                 |

## Refuted

The container's overflow clipping its fixed children; positioning against the viewport (no transform, filter or
contain on the container); a signal written during change detection; an effect loop or a stale host; an effect after
the app is destroyed; server rendering; an error snack announced again when its stack moves (a reparent in Chromium;
Firefox left to A9b's manual check); the close order and a confirmation's result; the modal's own nodes handed on;
styles inherited from the container; `openDialog` without `top` or `left`; a snack under an app element between 100
and 2000 (as on `main`); a nested modal and `showModal()` (allowed; nothing here blocks A9b).

Round 2: fixed overlays in the layer (placed against the viewport; a backdrop covers it); the layer taking a hit or
changing the container's size, scroll or Tab order; a modal opened from a modal (its backdrop covers the first
modal's layer); a tooltip in the layer against a list in the content; the wizard, a modal closed under another; the
close guard (only a re-entrant close changes); re-entrance from content that subscribes before the service; signals;
server rendering; A9b's `<dialog>` with the layer inside it; the API file; ids and attribution; the coverage floor;
the inherited cursor.
