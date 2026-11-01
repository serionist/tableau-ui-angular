---
title: Close the accessibility gaps for 0.3.0
issue: '#101'
status: draft
approved_by:
approved_at:
---

# Close the accessibility gaps for 0.3.0

This plan is the accessibility part of #101: sixteen issues, most of them minors from the codebase review
([2026-10-28-codebase.md](../reviews/2026-10-28-codebase.md)) that needed a pattern of their own, the rest found by the
tests and the docs site since. It sets each component's pattern from the WAI-ARIA Authoring Practices (the APG), the
public API each one needs, and one PR per area. 0.3.0 is a minor, so a change to the API file goes under CHANGELOG's
Breaking with how an app moves over.

#101's bug fixes land first. Each step starts from `origin/main` once the fixes in its files have merged (Steps).

## Goal

When this is done, 0.3.0 ships with:

|            |                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Patterns   | Each component below follows its APG pattern: its role, its name, its states, its keys, and where focus goes           |
| Checked    | A spec pins each role, state, name and key in Chromium and Firefox, and every component spec runs axe with no rule off |
| Contrast   | Error text reaches 4.5:1 on each surface the library draws it on, in both themes                                       |
| Closed     | #52, #53, #55, #57, #58, #60, #61, #62, #64, #65, #66, #67, #68, #75, #79, #97, and #59 once reopened (D1)             |
| Documented | Each changed docs page says what the component exposes, its keys, and what the app names                               |

Each gap stops a keyboard or screen-reader user in normal use: a modal opens with focus left on the page, a tooltip
never shows from the keyboard, a sort drops focus to the top of the page, tabs and trees read as loose text, a virtual
list can't be scrolled from the keyboard in Safari, an error appears and nothing says so.

In scope: the issues above, the docs pages and CHANGELOG lines they change, the error colour's values.

Out of scope:

- the table as a `grid` with cell navigation (D9);
- F79, dropdowns clipped by a transformed ancestor: `showModal()` moves modals only, and the popover API that would fix
  it gets an issue of its own when #58 closes;
- translations of the library's own words (D16), WebKit in the test run, hydration;
- the review's other open minors: F18, F23, F58, F78, F86, F87, F96, F101, F105, F107, F108, F113, F115, F116.

## Decisions

Each row is the maintainer's call; the design below follows the recommendation.

| #   | Decision                   | Options                                                                                                                                                                                                                                                                                                                                                                                                                              | Recommended                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Scope: #59                 | (a) the sixteen issues #101 lists; (b) also #59, reopened: it was closed with #91 on 2026-10-31, but `drawer-container.component.html` still only moves a closed drawer off-screen, and only the docs dashboard's own panel is `inert`                                                                                                                                                                                               | (b): one attribute and its test, in A3                                                                                                                                                                                                                                                                                                                                                                                                      |
| D2  | Shared code                | (a) nothing new and public: each component keeps its own keys, ids come from `generateRandomString()` (`tableau-ui-angular/utils`), hidden text copies the nav bar button's rule; (b) a roving-focus helper and a live announcer exported from `common`                                                                                                                                                                              | (a): entry points share code only through public exports, a one-way door since 0.2.0, and each piece is under 30 lines. The modernization's S7b left the same helper (I4) for that reason                                                                                                                                                                                                                                                   |
| D3  | Names the app gives        | (a) where the role sits on the host (radio group, button toggle, tree), the app's own `aria-label` or `aria-labelledby` on it; where it sits inside (the tab group's tablist, the table's and the virtual scroller's scroll region, the expansion panel's toggle, a modal without a header), a new optional `label`, as `tab-icon` names its input; (b) a `label` input on every component; (c) the host's `aria-label` moved inward | (a): five additions, each where an attribute on the host can't reach. (c) leaves `aria-label` on a host with no role, which ARIA prohibits and axe reports                                                                                                                                                                                                                                                                                  |
| D4  | Modals (#57, #58)          | (a) keep the `<div>`: `role="dialog"`, `aria-modal`, a name, focus in and back; the tabindex rewrite stays; #58 closes as not planned; (b) the native `<dialog>` with `showModal()`, with (a)'s name and focus, and overlays opened while a modal is open go into it; (c) (a) now and (b) in a later release                                                                                                                         | (b): the browser makes the rest of the page inert for every assistive technology and puts the modal above any z-index an app uses, while `openModal`, `openTemplateModal`, the confirmations and `IModalArgs` keep their shape. It costs a placement rule for tooltips and snacks, and a Breaking line for an app's own overlay opened from a modal. (a)'s name and focus are written to serve (b), so (c) stays open if A9 meets a blocker |
| D5  | Tooltips (#60)             | (a) the issue's fix: show on focus, hide on blur, Escape, `aria-describedby`; (b) (a) on keyboard focus only (`:focus-visible`), and a tooltip the pointer can move onto, as the APG pattern and WCAG 1.4.13 ask                                                                                                                                                                                                                     | (b): a tooltip on every click, or on the focus a closing dialog puts back, would cover what the user looks at                                                                                                                                                                                                                                                                                                                               |
| D6  | Tab activation (#62)       | (a) automatic: an arrow moves focus and selects; (b) manual: arrows move focus, Enter or Space selects                                                                                                                                                                                                                                                                                                                               | (a): every tab's content is in the page already, the case the APG names for automatic activation. `(tabSelected)` and `(afterActivate)` then fire on each arrow                                                                                                                                                                                                                                                                             |
| D7  | Button toggle (#62)        | (a) a radio group whose options take focus (roving tabindex); (b) a radio group whose host keeps focus, with `aria-activedescendant`; (c) toggle buttons with `aria-pressed`                                                                                                                                                                                                                                                         | (a): one value from a set is a radio group, its arrows already change the value, and a focused option shows its hint through A4's tooltip                                                                                                                                                                                                                                                                                                   |
| D8  | Tree (#61)                 | (a) the tree view pattern: nodes take focus (roving tabindex), arrows, Home, End, type-ahead, Enter; the toggles leave the Tab order; (b) `aria-expanded` on each toggle and a list with levels, keys as today                                                                                                                                                                                                                       | (a): the issue's fix; (b) still reads as a run of buttons. A control inside a node keeps its own Tab stop                                                                                                                                                                                                                                                                                                                                   |
| D9  | Table role (#64 to #66)    | (a) stay a `table`: a header row, a row group, `aria-sort`, a row count and index, named checkboxes, `aria-selected` rows; (b) a `grid`: one Tab stop, arrows between cells, `aria-selected` rows                                                                                                                                                                                                                                    | (a): the APG keeps a table for data the user reads, and (b) needs cell focus across virtual blocks that load and unload, a design of its own. #66 says a table's rows don't take `aria-selected`, but ARIA 1.2 lists it for every `row` and restricts only `aria-expanded`, `aria-level`, `aria-posinset` and `aria-setsize` to treegrids, so (a) keeps it                                                                                  |
| D10 | Row checkbox names (#66)   | (a) "Select row 12", from the row's place; (b) a new `rowLabel` input, a function from a row to its name, "Select Ada Lovelace", and (a) without it; (c) a column marked as the row header names it                                                                                                                                                                                                                                  | (b): one input, a string per row, no reading of rendered cells, and it works in a virtual table                                                                                                                                                                                                                                                                                                                                             |
| D11 | Scroll regions (#68)       | (a) the virtual scroller's host takes focus as a `list` named by `label`, its items `listitem` with `aria-posinset` and `aria-setsize`; the table's host takes focus as a `region` named by `label`; (b) both a named `region`; (c) a documented rule that items hold a focusable element                                                                                                                                            | (a): a screen reader then says where in the whole list an item is, which virtual scrolling otherwise hides; the table has its own row count (#64)                                                                                                                                                                                                                                                                                           |
| D12 | Errors and hints (#52)     | (a) `aria-describedby` from the control to its hint and its error, `aria-invalid` while the error shows; (b) `aria-errormessage` for the error. Either one with or without announcing an error that appears while focus is in the field                                                                                                                                                                                              | (a), with the announcement for the field that has focus: screen readers read `aria-describedby` widely and `aria-errormessage` less, and announcing only there keeps a submit with five errors quiet                                                                                                                                                                                                                                        |
| D13 | Chip highlight (#55)       | (a) a polite live region in the chip control says which chip is highlighted and which was removed; (b) the chips as a listbox the input points into with `aria-activedescendant`; (c) focus moves onto the chips                                                                                                                                                                                                                     | (a): focus and keys stay as they are, the input keeps one role, and the chips need no wrapper in the control's flex layout                                                                                                                                                                                                                                                                                                                  |
| D14 | Expansion panel name (#79) | (a) a `label` input names the toggle, and the title's JSDoc says a title holding a control needs it; (b) the toggle's name built from the title's text without its controls, rebuilt as it changes; (c) the JSDoc only                                                                                                                                                                                                               | (a): explicit, a plain string, no observer                                                                                                                                                                                                                                                                                                                                                                                                  |
| D15 | Error colour (#97)         | (a) the dark `--twc-color-error` only, as the issue says; (b) both themes, and the error button's label in `--twc-color-base`                                                                                                                                                                                                                                                                                                        | (b): today light error text on a selected row is 3.70:1 and the error button's label is 4.19:1 light and 3.21:1 dark; a lighter dark red alone makes that label worse. Proposed: dark `rgb(255 133 133)`, light `rgb(190 10 30)` (Design); the maintainer may pick others that pass. The property names stay                                                                                                                                |
| D16 | The library's words        | (a) English, as its words are today ("Close", "Remove", "Menu"); (b) an input or a token for each                                                                                                                                                                                                                                                                                                                                    | (a), and an issue for translations when an app asks                                                                                                                                                                                                                                                                                                                                                                                         |

## Design

Every area follows its APG pattern; the tables below give each role, state and key, and each public API change with
its CHANGELOG section.

### Common to every area

- Hidden text uses the nav bar button's rule (absolute, one pixel, `clip-path: inset(50%)`), copied into each
  component's SCSS (D2).
- Ids come from `generateRandomString()` in `tableau-ui-angular/utils`, as the form field's and the tree's do.
- An element that newly takes focus shows `outline: 2px solid var(--twc-color-focused-input)` on `:focus-visible`, as
  `_lib-main.scss` does for links.
- On an element the app owns, a native input or a host, the library adds its ids to the app's own `aria-describedby`
  or `aria-labelledby` and removes only its own.
- Roles, ids and `aria-*` render on the server; focus moves run in event handlers or `afterNextRender`, so every route
  still prerenders with no error.
- New words are English (D16).

### Theme colours (#97, A1)

The error colour's value moves in both themes and the error button's label takes the base colour, so error text
reaches 4.5:1 on every surface it sits on (D15).

| Error text on            | Light, now and proposed | Dark, now and proposed |
| ------------------------ | ----------------------- | ---------------------- |
| The base                 | 4.64, 6.46              | 4.15, 7.34             |
| A selected row           | 3.70, 5.15              | 3.26, 5.76             |
| The keyboard highlight   | 3.38, 4.71              | 2.66, 4.70             |
| A modal's header         | 4.18, 5.82              | 3.55, 6.28             |
| The error button's label | 4.19, 6.46              | 3.21, 7.34             |

- `styles/colors/_light.scss` and `_dark.scss` change `color-error` only; `button.component.scss` gives the error
  button `color: var(--twc-color-base)`, white on the light red and near black on the dark one.
- API: none; the property names are a one-way door and stay. CHANGELOG: Fixed.

### Forms (#52, #53, A2)

The form field, the checkbox and the radio group describe the control by its hint and its error, mark it invalid while
the error shows, and the radio group becomes a named `radiogroup` (D12).

| Where             | What changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tab-form-field`  | The hint and the error project into wrappers with ids. The control the field names (a native input, textarea or select, a select's or list's host, the chip control's input) gets `aria-describedby` to the shown hint, then the error, and `aria-invalid="true"` while the error shows, kept in step by an effect. A hidden polite region repeats an error that appears or changes while focus is inside the field. `tab-radio-group` joins the controls the field names, through `aria-labelledby` on its host |
| `tab-checkbox`    | Its input gets `aria-describedby` to its hint and error wrappers, and `aria-invalid` while the error shows                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tab-radio-group` | Its host is `role="radiogroup"`, named by a form field's label or the app's `aria-label` or `aria-labelledby` on it, described by its error, `aria-invalid` while the error shows. The native radios keep their keys                                                                                                                                                                                                                                                                                             |

- API: none. CHANGELOG: Fixed.

### Chips, the expansion panel and the drawer (#55, #75, #79, #59, A3)

Each gets the name or the announcement its issue asks for; only the expansion panel needs a new input.

| Where                        | What changes                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tab-chip-control` (#55)     | A hidden polite region in the host. When a key highlights a chip it says "Berlin, highlighted. Backspace or Delete removes it."; when a key removes one, "Berlin removed." A chip's words are its wrapper's text without hidden parts, such as an icon's ligature. Focus, keys and the input's role stay (D13) |
| `tab-chip` (#75)             | The remove button is named by its icon's label and the chip's content, both in its `aria-labelledby`: "Remove Berlin". The content projects into a span with an id and `display: contents`, so the flex layout stays                                                                                           |
| `tab-expansion-panel` (#79)  | A new `label` input names the toggle, as its icon's `aria-label`; without it the title names it, as today. The title's JSDoc says a title holding a control needs `label` (D14)                                                                                                                                |
| `tab-drawer-container` (#59) | A closed drawer's wrapper is `inert`, so Tab skips it and a screen reader doesn't read it (D1)                                                                                                                                                                                                                 |

- API: Added `ExpansionPanelComponent.$label` (`label`). CHANGELOG: Added, Fixed.

### Tooltips (#60, A4)

A tooltip shows on keyboard focus as on hover, Escape hides it, the pointer can move onto it, and it describes its
element while it shows (D5).

| When                                                   | What happens                                                                                                                                                                                                    |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The element gets focus and shows it (`:focus-visible`) | The tooltip shows; the focus a click gives doesn't show it                                                                                                                                                      |
| The element loses focus                                | It hides, unless the pointer is on the element or the tooltip                                                                                                                                                   |
| The pointer leaves the element                         | It hides after 100 ms, unless the pointer reaches the tooltip; leaving the tooltip hides it                                                                                                                     |
| Escape while it shows                                  | It hides and the key stops there: the tooltip opens with `closeOnEscape`, so the dialog service's one Escape handler closes it before any dialog below; the next Escape reaches that dialog                     |
| It shows                                               | Its element is `role="tooltip"` with an id, and the host's `aria-describedby` gains that id, the app's ids kept. A string tooltip equal to the host's own name adds none, as on the nav bar's collapsed buttons |

- The container takes the pointer (`pointer-events` on), so it can be hovered.
- #82 adds the padding to `createTooltip()`, the method this step changes; A4 starts after it.
- API: none. `onMouseEnter()` and `onMouseLeave()` stay; the new handlers are protected. CHANGELOG: Fixed.

### Tabs and the button toggle (#62, A5)

The tab group follows the tabs pattern with automatic activation (D6), and the button toggle the radio group pattern
with roving focus (D7).

| Tab group element | Role and state                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.tab-headers`    | `role="tablist"`, named by a new `label` input                                                                                                          |
| Each header       | `role="tab"`, an id, `aria-selected`, `aria-controls` its panel, `aria-disabled` when disabled; `tabindex="0"` on the selected tab only, `-1` elsewhere |
| Each content      | `role="tabpanel"`, an id, `aria-labelledby` its tab, `tabindex="0"`                                                                                     |

| Key on a tab | Does                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| Right, Left  | The next or previous enabled tab, wrapping, takes focus and is selected (D6) |
| Home, End    | The first or last enabled tab                                                |
| Enter, Space | Selects it, as today                                                         |

| Button toggle element | Role and state                                                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The host              | `role="radiogroup"`, `aria-disabled` when disabled, named by the app's `aria-label`; no longer in the Tab order itself                                                                                                                    |
| Each option           | `role="radio"`, `aria-checked`, `aria-disabled`; `tabindex="0"` on the checked option, or the first enabled one when none is, `-1` elsewhere and on all while disabled; named by its text, or by its string hint when it has only an icon |

| Key on an option | Does                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Right, Down      | The next enabled option, wrapping, takes focus and is checked     |
| Left, Up         | The previous enabled option, wrapping, takes focus and is checked |
| Space            | Checks the focused option                                         |

- Focus scrolls a tab into the strip, as selection does; a focused option shows its hint through A4's tooltip.
- API: Added `TabGroupComponent.$label` (`label`). `TabGroupComponent.onkeydown()` and
  `ButtonToggleComponent.onKeyDown()` keep their signatures. CHANGELOG: Added; Breaking for both keyboards.

### Tree (#61, A6)

The tree follows the tree view pattern: one node takes focus at a time and the arrows move through and open the tree
(D8).

| Element         | Role and state                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tab-tree`      | `role="tree"`, named by the app's `aria-label` or `aria-labelledby` on it                                                                                                                                                                      |
| Each node's row | `role="treeitem"`, `aria-level` (1 at the root, whatever `showRootGridLines`), `aria-setsize` and `aria-posinset` among its siblings, `aria-expanded` when it has children; `tabindex="0"` on one node, the first at the start, `-1` elsewhere |
| The toggle      | `aria-hidden="true"` and `tabindex="-1"`: the pointer still clicks it, and the node carries its state                                                                                                                                          |

| Key on a node | Does                                                          |
| ------------- | ------------------------------------------------------------- |
| Down, Up      | The next or previous shown node                               |
| Right         | Opens a closed node; on an open one, moves to its first child |
| Left          | Closes an open node; on a child, moves to its parent          |
| Home, End     | The first or last shown node                                  |
| Enter         | Opens or closes a node with children                          |
| A letter      | The next shown node whose text starts with it                 |

- Closing a node with focus in a child moves focus to it; when the focused node goes, focus goes to the shown node
  before it. Keys from a control inside a node's content stay the control's.
- The rows are siblings in the DOM, so the levels, sizes and positions carry the structure, which ARIA allows in place
  of `group` elements.
- #83 decides first what `hierarchyMode` does; `aria-level` comes from the depth it leaves.
- API: none. CHANGELOG: Breaking, since the nodes take focus and the toggles leave the Tab order.

### The table and the virtual scroller (#64, #65, #66, #68, A7)

The table stays a `table` (D9) with real rows, a row count, the sort, named checkboxes and a focusable scroll region;
the virtual scroller becomes a focusable, named list (D11).

| Where                | What changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rows (#64)           | The header row is `role="row"` with `aria-rowindex="1"`; `.data-rows` is a `rowgroup`; each data row's `aria-rowindex` is its place plus 2; the table's `aria-rowcount` is the total plus 1, and `-1` until the total is known. The spacers are `aria-hidden`; "No data available" is a row with one cell across the columns                                                                                                                                                                         |
| Sort (#65)           | Enter or a click sorts and keeps focus on the header's button, whose tooltip shows the new sort. The first sort's header has `aria-sort`, `ascending` or `descending`; in a multi-sort a later sort says its place in its button's hidden text, "sort 2, descending". Shift+Enter and Shift+Space add to a multi-sort as Shift+Click does, and the header's tooltip says so                                                                                                                          |
| Selection (#66)      | Each row's checkbox is named "Select" and `rowLabel(row)` from a new `rowLabel` input, or "Select row 12" without it (D10); the header's is "Select all rows" or "Clear the selection"; the selection column's header has the hidden text "Selection". Each name is hidden text in the checkbox's own label, so `tab-checkbox` needs no new input. A loaded row has `aria-selected` while selection is on; its checkbox's state says the same where a screen reader doesn't read a table row's state |
| Scroll regions (#68) | The table's host takes focus (`tabindex="0"`); with a new `label` it is a `region` named by it, and the `table` too. The virtual scroller's host takes focus and, while it shows items, is a `list` named by its new `label`, each item a `listitem` with `aria-posinset` and `aria-setsize`, `-1` until the total is known                                                                                                                                                                          |

- #92 and #96 change the rows' widths and #71 their heights; A7 starts from what they leave.
- API: Added `TableComponent.$label` (`label`), `TableComponent.$rowLabel` (`rowLabel`), `VirtualizeComponent.$label`
  (`label`). CHANGELOG: Added, Fixed.

### Column resizing (#67, A8)

The resizer becomes a focusable separator the arrow keys move, and pointer events let touch and pen drag it.

| The resizer    | What it is and does                                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Role and state | `role="separator"`, `aria-orientation="vertical"`, `tabindex="0"`, `aria-valuenow` the column's width in px, `aria-valuemin` its minimum, `aria-valuemax` its maximum when it has one; named "Resize" and the header's text, through `aria-labelledby` |
| Keys           | Right and Left widen and narrow the column by 10px, 50px with Shift, within its minimum and maximum; Home goes to the minimum, End to the maximum when there is one                                                                                    |
| Pointer        | `pointerdown` with pointer capture, `pointermove`, `pointerup` and `pointercancel`; `touch-action: none` on the resizer                                                                                                                                |

- API: `ResizerDirective.onMouseDown()` leaves the API file. The directive is in neither the module's exports nor the
  entry point's, so no app can use it; the PR names the change. CHANGELOG: Fixed.

### Modals (#57, #58, A9)

A modal is a native `<dialog>` shown with `showModal()` (D4): the browser puts it in the top layer, makes the rest of
the page inert, exposes it as a modal dialog and draws its backdrop.

| What           | How                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The element    | `openModal`, `openTemplateModal` and the two confirmations render in a `<dialog class="dialog-container">`. Its `::backdrop` takes `--twc-modal-color-backdrop`, and `_dialog.service.scss` resets the element's own margin, padding, border, colour and inset. Non-modal dialogs (`openDialog`, dropdowns, menus, tooltips) stay `<div>`s with their backdrop `<div>`                                                                                   |
| Name           | `aria-labelledby` its header's title; a modal without a header takes a new `label` in `IModalArgs`                                                                                                                                                                                                                                                                                                                                                       |
| Focus in       | The content's first `[autofocus]` element, else its first tabbable element, else the header's close button, else the dialog itself. The confirmation marks its chosen button `autofocus` instead of focusing it                                                                                                                                                                                                                                          |
| Focus back     | To the element focused before it opened, when that is still in the page                                                                                                                                                                                                                                                                                                                                                                                  |
| Escape         | The service's one handler still picks the top dialog that closes on Escape, and cancels the keydown, which in HTML's close request steps stops the browser's own close. A `cancel` from another close request, such as a back gesture, closes through the `DialogRef` when `closeOnEscape` allows it and is cancelled otherwise; a `close` the page couldn't cancel still closes the `DialogRef`                                                         |
| Backdrop click | A click whose target is the `<dialog>` itself closes it when `closeOnBackdropClick`                                                                                                                                                                                                                                                                                                                                                                      |
| Overlays in it | The select, the autocomplete and the menu insert their overlays after their own element, so inside the `<dialog>` already. An overlay with `GlobalStackOptions`, a tooltip or an app's `openDialog`, opened while a modal is open goes into the topmost modal instead of the body. A new `DialogService.$overlayHost` signal, the topmost modal's `<dialog>` or `null`, tells the snack service where its stack goes; it moves the stack in and back out |
| Kept           | `dialogStack`, `startZIndex`, `zIndexStep`, `escapeSubscription`, `_openModal` and `trapFocus` stay. Modals stay on the stack for Escape's order; non-modal dialogs that ask for `trapFocus`, such as menus, keep the tabindex rewrite                                                                                                                                                                                                                   |

- #99 changes when the autocomplete's suggestions open, an overlay this step places; A9 starts after it and after A4.
- The snack service now imports `tableau-ui-angular/dialog`, through its public export.
- API: Added `IModalArgs.label`, `DialogService.$overlayHost`. `ConfirmationDialogComponent` loses
  `ngAfterContentInit()` and `ngAfterViewInit()`; no module exports it and the entry point doesn't, so the PR names
  the change. CHANGELOG: Added; Breaking for overlays an app appends itself and for CSS on a modal's backdrop
  (Compatibility).

## Compatibility

The one-way door this touches is the public API file: seven additions, and members removed from two classes no app can
import (`ResizerDirective` in A8, `ConfirmationDialogComponent` in A9). No selector, export, SCSS path, theme property
name or peer changes. The keyboard and focus changes apps notice go under Breaking, as 0.x allows.

| Step | What an app sees                                                                                                                                                                                                       | CHANGELOG                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | Error text and error buttons in a darker red in the light theme and a lighter one in the dark; the error button's label in the base colour                                                                             | Fixed: "Error text reaches 4.5:1 on every surface in both themes: `--twc-color-error` is `rgb(190 10 30)` light and `rgb(255 133 133)` dark, and the error button's label takes `--twc-color-base`. Styles that copied the old red read the property instead"                                                                                                                    |
| A2   | `aria-describedby` and `aria-invalid` on the control a form field, a checkbox or a radio group names, the app's own ids kept; `tab-radio-group` is a named `radiogroup`                                                | Fixed                                                                                                                                                                                                                                                                                                                                                                            |
| A3   | A chip's remove button is named "Remove Berlin", so a test that finds it by the name "Remove" finds it by the chip's text too; a closed drawer is inert                                                                | Added: `label` on `tab-expansion-panel`. Fixed: the rest                                                                                                                                                                                                                                                                                                                         |
| A4   | Tooltips show on keyboard focus and hide on Escape, and the pointer can rest on one: a click on a tooltip no longer reaches what is under it                                                                           | Fixed                                                                                                                                                                                                                                                                                                                                                                            |
| A5   | A tab group is one Tab stop whose arrows select, so `(tabSelected)` and `(afterActivate)` fire on each arrow. A button toggle's options take focus, not the group, and an icon-only option is named by its string hint | Added: `label` on `tab-group`. Breaking: "A tab group is one Tab stop: the arrows, Home and End move between tabs and select them. Code that loads data on `(tabSelected)` sees it once per arrow." "A button toggle's options take focus, not the toggle: code that focused the toggle focuses its checked option. An option with only an icon needs a string `hint`, its name" |
| A6   | Tree nodes take focus, the arrows open and close them, and the toggles leave the Tab order                                                                                                                             | Breaking: "A tree is one Tab stop: the arrows move between nodes and open and close them, and Enter toggles. The toggles take no focus; a click still toggles. Name the tree with `aria-label` on `tab-tree`"                                                                                                                                                                    |
| A7   | The table's and the virtual scroller's hosts are Tab stops; a sort keeps focus; Shift+Enter adds to a multi-sort; row checkboxes are named and selected rows `aria-selected`                                           | Added: `label` and `rowLabel` on `tab-table`, `label` on `tab-virtualize`. Fixed: the rest                                                                                                                                                                                                                                                                                       |
| A8   | Columns resize from the keyboard and by touch                                                                                                                                                                          | Fixed                                                                                                                                                                                                                                                                                                                                                                            |
| A9   | Modals are `<dialog>`s in the top layer, above any z-index; overlays opened through the dialog service from a modal go into it, snacks too                                                                             | Added: `label` in `IModalArgs`, `DialogService.$overlayHost`. Breaking: "An overlay an app appends to the body itself, opened from a modal, sits under the modal and is inert: open it through `DialogService`, or inside the modal. CSS on a modal's `.dialog-backdrop` moves to `dialog.dialog-container::backdrop`, or sets `--twc-modal-color-backdrop`"                     |

## Steps

One PR per area, each with its specs, its docs page and its CHANGELOG lines. Per the maintainer, CI judges each PR and
the heavy local runs wait for #101's final test pass; after A9 come that pass and the 0.3.0 release.

The bug PRs in #101 go first: #92, #96, #71 and #70 (the table and the virtual scroller), #80, #82, #83 and #99 (inputs
and the autocomplete), #74 (the form group), #84 (`dev:link`). A step that shares files with one starts from
`origin/main` once it has merged, and reads what it changed.

| Step | What                                                                                                                         | Closes             | Starts after       | Proven by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A0   | This plan                                                                                                                    |                    |                    | `review-plan` approves it and the maintainer does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| A1   | The error colour in both themes, the error button's label; the theming page                                                  | #97                | A0                 | A spec in `theme/` reads the computed colours of error text on the base, a selected row, the keyboard highlight and a modal's header, and of the error button's label, in both themes: each 4.5:1 or more                                                                                                                                                                                                                                                                                                                                                                                |
| A2   | The form field, the checkbox and the radio group; their pages                                                                | #52, #53           | A0                 | A form field's native input, select, list and chip control get the hint's id, then the error's, as each shows, and lose them as they go, an app's id kept; `aria-invalid` only while the error shows; the region repeats an error that appears with focus in the field and not one that appears with focus elsewhere; the radio group is a `radiogroup` named by the field's label and by its own `aria-label`; the checkbox's input is described by its hint and its error; axe with no rule off                                                                                        |
| A3   | The chip control's region, the chip's remove name, the expansion panel's `label`, the closed drawer; their pages             | #55, #75, #79, #59 | A0                 | The region's text after Backspace, the arrows and Delete, and none on other keys; the remove button found by role and the name "Remove Berlin" in both browsers; the toggle named by `label`, and by the title without it; Tab skips a closed drawer's link and reaches it once the drawer opens; axe                                                                                                                                                                                                                                                                                    |
| A4   | Tooltips; the tooltips page                                                                                                  | #60                | #82                | A tooltip shows on keyboard focus and not on a click's; blur hides it unless the pointer is on it; the pointer moves from the element onto the tooltip and it stays; Escape hides it and a dialog below stays open until the next Escape; `role="tooltip"` and `aria-describedby` while it shows, the app's ids kept, none for a tooltip equal to the name; axe                                                                                                                                                                                                                          |
| A5   | The tab group and the button toggle; the tabs and buttons pages                                                              | #62                | A4                 | The tab roles and states; one Tab stop on the selected tab; Right and Left wrap and skip a disabled tab, Home and End, each selecting; each panel labelled by its tab. The toggle's roles and `aria-checked`; one Tab stop; the arrows check and wrap past disabled options; Space; an icon-only option named by its hint, which shows on focus; axe                                                                                                                                                                                                                                     |
| A6   | The tree; the tree page                                                                                                      | #61                | #83                | `tree` and `treeitem` with level, size, position and expanded, for nested and `hierarchyParentId` trees; one Tab stop; each key, type-ahead included; closing a node with focus in a child moves focus to it; the toggle hidden and out of the Tab order, still toggling on a click; axe                                                                                                                                                                                                                                                                                                 |
| A7   | The table's rows, sort, selection names and scroll region, the virtual scroller's list; their pages and the dashboard sample | #64, #65, #66, #68 | #92, #96, #71, #70 | The header row and the row group; `aria-rowcount` and each row's `aria-rowindex` after scrolling to a later block; `aria-sort` on the first sort's header and a second sort's place; focus on the header's button after Enter; Shift+Enter adds a sort; checkbox names with and without `rowLabel`, the header checkbox's in both modes; `aria-selected` follows a click and a checkbox; both hosts take focus and are named; arrow keys on a focused virtual scroller load the next block; item positions; axe with no rule off in both specs, with a table that has no sortable column |
| A8   | Column resizing; the table page                                                                                              | #67                | A7                 | The separator's role, name and values; Right, Left, Shift, Home and End change the width within its bounds; a pointer drag resizes through pointer events; axe                                                                                                                                                                                                                                                                                                                                                                                                                           |
| A9   | Modals as `<dialog>`s, the overlay placement, the snack stack; the dialogs and snackbar pages; the README line               | #57, #58           | A4, #99            | A modal is an open `<dialog>` that matches `:modal`, named by its title or `label`; focus goes in by the order above and back on close; Escape closes the top dialog first, and a `closeOnEscape: false` modal survives two; a backdrop click closes; content outside takes no focus; a select, an autocomplete, a menu, a tooltip and a snack opened over a modal sit above it (`elementFromPoint` at their centre finds them) and take focus and clicks; a confirmation over a modal; the backdrop's colour in both themes; axe                                                        |

A1, A2 and A3 touch separate entry points and can be built side by side, each in its own worktree; A4 and A6 can too.

## Tests

The specs pin what each pattern asks for in both browsers; what a screen reader says is checked by hand in #101's
final pass.

| Suite                                                               | Runs where   | New or changed                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component specs (Vitest in browser mode, Chromium and Firefox, axe) | CI, every PR | Each step's roles, states, names, keys and focus, found by role and name where the browser computes them; A7 removes the last five rules turned off (`aria-required-children`, `aria-required-parent`, `label`, `empty-table-header`, `scrollable-region-focusable`) |
| The contrast spec in `theme/`                                       | CI, every PR | New in A1                                                                                                                                                                                                                                                            |
| `docs-pages.spec.ts`, `docs-samples.spec.ts`                        | CI, every PR | The texts and names that change: the tabs page's keys, the dashboard's chip remove buttons and tabs                                                                                                                                                                  |
| The docs site's prerender                                           | CI, every PR | No new route; every route still prerenders with no error                                                                                                                                                                                                             |
| The API file compare                                                | CI, every PR | Each step's additions, and A8's and A9's removals, named in its PR                                                                                                                                                                                                   |

- What neither shows: speech. #101's final pass walks each changed page with NVDA on Windows, in Firefox and in
  Chrome, keyboard only, and with VoiceOver on macOS when one is at hand.
- WebKit is not in the run: #68's Safari case rests on the `tabindex` and roles the specs pin.
- Each new test is seen to fail without its change in #101's final pass, as #101 sets.
- The coverage floor rises with the new code's tests, as `tools/coverage.json` asks.

## Docs

- Each changed component page gets a short Accessibility section: the roles, the keys, and what the app names (a
  `label`, an `aria-label` on the host, a string hint). The pages: form fields, checkbox, radio buttons, chips,
  expansion panel, drawer, tooltips, tabs, buttons (the toggle), tree, table, virtualization, dialogs, snackbar,
  theming.
- Text that changes: the tabs page's "Each header is in the Tab order", the tooltips page's hover-only wording, the
  tree page's toggles.
- The radio forms sample names its group with `aria-labelledby` on `tab-radio-group`, where a `fieldset` stood in
  until #53 (the modernization's S10b-1).
- The dashboard sample and its spec follow the new names and keys.
- CHANGELOG: each step's lines under Unreleased (Compatibility).
- README: in A9, one line that each component follows its WAI-ARIA pattern, checked with axe in Chromium and Firefox.
- AGENTS.md: no change. It is at 149 of its 150 lines; the overlay rule for modals lives in the dialog service's
  JSDoc and on the dialogs page.

## Risks

| #   | Risk                                                                                                                                           | Status                                                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | The bug PRs change the files A4, A6, A7 and A9 change: the tooltip's `createTooltip()`, the tree's depth, the table's rows, the autocomplete   | Resolved: each step starts after its fixes merge, from `origin/main` (Steps)                                                                      |
| R2  | Without a user activation since the last one, a `<dialog>`'s `cancel` can't be cancelled, so Escape would close a `closeOnEscape: false` modal | Resolved in the design: A9 cancels Escape's keydown, which stops the close request before `cancel`; a spec presses Escape twice, in both browsers |
| R3  | `::backdrop` must read the theme's variables, which it inherits from its dialog only in current browsers                                       | A9's spec reads the backdrop's computed colour in both themes                                                                                     |
| R4  | An overlay an app appends to the body itself, opened from a modal, goes under it and is inert                                                  | Accepted: a Breaking line and the dialogs page; overlays opened through the dialog service move by themselves                                     |
| R5  | A snack moved into a modal and back could be announced twice                                                                                   | Accepted: it moves only when a modal opens or closes while the snack shows                                                                        |
| R6  | Automatic tab activation fires `(tabSelected)` on each arrow, which an app may load data on                                                    | Accepted with D6; manual activation is the other option                                                                                           |
| R7  | A chip's content in a `display: contents` span must still name the remove button                                                               | A3's spec finds the button by its role and full name in both browsers                                                                             |
| R8  | A tooltip the pointer can rest on covers what is under it a little longer                                                                      | Accepted: it hides 100 ms after the pointer leaves the element, unless the pointer is on it (D5)                                                  |
| R9  | Speech and Safari can't be tested in CI                                                                                                        | Accepted: the specs pin roles, states, names and keys; #101's final pass walks the pages with a screen reader                                     |
| R10 | The heavy test runs wait for #101's final pass, so a failure shows late                                                                        | Accepted: CI runs the full lane on every PR, in both browsers                                                                                     |
| R11 | The new error colours change every app's look                                                                                                  | Accepted: the names stay, CHANGELOG says so, and the maintainer picks the values (D15)                                                            |

## Plan review

None yet: `review-plan` writes its rounds here.

## Decided without asking

None yet.

## Progress log

- 2026-11-01: drafted from #101 and its sixteen issues, the codebase review, the components with their specs and API
  files, and the APG patterns; #59 found closed with the library's drawer unchanged (D1).
