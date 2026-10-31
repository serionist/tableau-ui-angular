# Changelog

What changed for apps that use tableau-ui-angular, newest first. A change apps notice adds its line under Unreleased
in the same PR, and one that breaks them goes under Breaking, with how to move over. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); each release's heading is `## X.Y.Z (YYYY-MM-DD)`.

## Unreleased

### Breaking

- Angular 22: the peers are `@angular/*` `^22.0.0`. Update the app to Angular 22 (`ng update`), or stay on 0.1.129,
  the last release for Angular 20, which gets no more fixes.
- `rxjs` `^7.4.0` is a peer dependency. Angular apps have it already; one that doesn't list it in its own
  `package.json`, under pnpm or Yarn Plug'n'Play, adds it.
- `monaco-editor` is an optional peer, so it is no longer installed for every app. An app that uses
  `tableau-ui-angular/monaco` installs it itself: `npm install monaco-editor@^0.52.2`.
- The package is `"type": "module"`, and its typings sit under `types/`. Imports from `tableau-ui-angular/<folder>`
  are unchanged; a deep import of a `.d.ts` path moves to its file under `types/`.
- The table's data types come from `tableau-ui-angular/virtualize`: `DataOptions`, `IncrementalDataOptions`,
  `FullDataOptions`, `FullDataRequest`, `IncrementalDataRequest`, `FullDataResponse`, `IncrementalDataResponse` and
  `DataSort`. Change their imports from `tableau-ui-angular/table`.
- `TableComponent` needs its type argument, the type of a row: the `number` default is gone. Write
  `TableComponent<number>` where code wrote `TableComponent`.
- The table's `dataRowHeight` and `dataPadding` inputs become one `dataRowCss` input, which needs `height`,
  `lineHeight` and `padding`: for `dataRowHeight="2em"` and `dataPadding="0 1em"`, bind
  `[dataRowCss]="{ height: '2em', lineHeight: 'inherit', padding: '0 1em' }"`.
- `TableComponent.dataManager` is protected: the table extends `VirtualizeBaseComponent`, which keeps its data manager
  for itself and the components that extend it. `load()`, `reload()` and `reset()` stay public. Code that read
  `table.dataManager` for the row count or the loaded rows keeps what the table's `dataOptions` loader answers
  (`total`, `data`), and reads the selection from `[(selectedRows)]`.
- `DatePickerDirective.$value` and `TabTreeNodeComponent.$expanded` are writable signals, no longer models, and their
  inputs' class members are `$valueInput` and `$expandedInput`. `[(value)]` and `[(expanded)]` bind as before, and
  `()` reads as before. `.set()` changes what the control shows and no longer emits `valueChange` or `expandedChange`,
  nor updates a two-way binding: set the bound value instead. Code that typed them as `ModelSignal` or subscribed to
  them types them as `WritableSignal` and listens to `valueChange` or `expandedChange`.
- `tab-checkbox` and `tab-radio-group` emit `(valueChange)` on each toggle or pick by the user, and never when a form
  writes their value (on init, `setValue`, `reset`). Code that followed the form's value through `(valueChange)`
  subscribes to the control's `valueChanges` instead.
- `CheckboxComponent.$value` and `RadioGroupComponent.$value` are writable signals, no longer models; their inputs'
  class members are `$valueInput`, and `valueChange` is an output of its own. `[(value)]` binds as before, and `()`
  reads as before. `.set()` changes what the control shows and no longer emits `valueChange`, nor updates a
  `[(value)]` binding: set the bound value instead. Code that typed them as `ModelSignal` or subscribed to them types
  them as `WritableSignal` and listens to `valueChange`.
- `tab-monaco-editor` emits `(valueChange)` only for the user's edits, never when a form writes its value (on init,
  `setValue`, `patchValue`, `reset`). `MonacoEditorComponent.$value` is a writable signal, no longer a model; its
  input's class member is `$valueInput`, and `valueChange` is an output of its own. `[(value)]` binds as before, and
  `$value()` reads as before. `$value.set()` changes what the editor shows and no longer emits `valueChange`, nor
  updates a `[(value)]` binding: set the bound value instead. Code that typed it as `ModelSignal` or subscribed to it
  types it as `WritableSignal` and listens to `valueChange`; code that followed the form's value through
  `(valueChange)` subscribes to the control's `valueChanges` instead.
- `tab-checkbox` and `tab-radio-group` mark their control touched on blur, as Angular's own checkbox and radio buttons
  do, not when the user toggles or picks. An error shown once the control is touched now shows when the user leaves it,
  or on `markAllAsTouched()` at submit.
- `tab-checkbox`'s text is a `<label>` around its input, which names it. A click on the hint or the error no longer
  toggles it, nor does one on a link or a button inside the text. Styles that targeted the inner `div.label` target
  `.label`, now a `span` inside `label.control`.
- `tab-icon` is hidden from screen readers (`aria-hidden="true"`) unless it has the new `label` input, which makes it
  an image with that name. An icon that means something on its own, such as the only content of a button, takes one:
  `<tab-icon value="delete" label="Delete" />`.
- The `formGroupValue` and `formArrayValue` pipes give the value without an argument, disabled fields left out, as
  their type says; they gave the raw value. Pass `'raw'` for the raw value: `form | formGroupValue: 'raw'`.
- `tab-form-field` has no `style` input. It was unused, and it took a `[style]` binding away from the host; a `style`
  attribute or a `[style]` binding now styles the field itself.
- `FormFieldComponent` and `ArrowScrollComponent` have no `ngAfterViewInit`: their measuring and observers start after
  the first render in the browser, so they can render on the server. Code that called the method has nothing to call;
  the component does that work itself.
- `tab-single-select`, `tab-multi-select`, `tab-list-single-select`, `tab-list-multi-select`, `tab-chip-control` and
  the date picker mark their control touched when the user leaves them, as Angular's own inputs do, not on focus, on
  each input or when an option is picked. An error shown once the control is touched now shows when the user leaves
  it, or on `markAllAsTouched()` at submit; with `updateOn: 'blur'` the last change is now committed.
- `tab-chip-control` tells the form only of the user's changes: a chip's remove button, Delete or Backspace, `add()`
  and `remove()`. A form's write (on init, `setValue`, `reset`) no longer marks it dirty or emits `valueChanges` again,
  and the keys or values the app binds no longer reach the form. Code that set `[keys]` or `[values]` on a control bound
  to a form sets the form's value instead.
- The date picker takes a typed date as that day at local midnight; it took midnight UTC, so west of UTC the form held
  the day before. East of UTC the `Date` is now earlier than it was, so `value.toISOString().slice(0, 10)` gives the day
  before: read the day with `getFullYear()`, `getMonth()` and `getDate()`, as the date picker writes it. Build the
  dates it is compared with, such as the bounds of `DateValidators.minDate` and `maxDate`, as
  `new Date(y, m - 1, d)`, not `new Date('yyyy-mm-dd')`, in every time zone: a bound parsed from a string is midnight
  UTC, so west of UTC the last allowed day fails `maxDate`, and east of it the first allowed day fails `minDate`.
- `DatePickerDirective` has no `onFocus()`: the date picker is touched on blur. Code that called it has nothing to
  call.
- `SingleSelectComponent` and `MultiSelectComponent` have no `ngAfterViewInit`, `registerFocusChange`,
  `unregisterFocusChange`, `checkFocus` or `focusChangeFn`: the select listens for focus leaving on itself and its
  dropdown, not on the document, so it can render on the server. Code that called them has nothing to call.
- `tab-single-select` has no `$multipleSelectionMaxItemsListed` input. It was there only for the template it shares
  with `tab-multi-select`, and a single select never read it. Remove a `[$multipleSelectionMaxItemsListed]` binding
  from a `tab-single-select`; `tab-multi-select`'s `multipleSelectionMaxItemsListed` is unchanged.
- `MenuButtonGroupComponent` has no `ngAfterViewInit`: it builds, measures and focuses its menus after the first render
  in the browser. Code that called the method has nothing to call.
- The `tableau-ui-angular/stepper` entry point is gone: its `tab-stepper` and `tab-step` rendered only a placeholder
  ("stepper works!"). Remove the imports of `TableauUiStepperModule`, `StepperComponent` and `StepComponent`, and the
  elements.
- `tab-menu-button`'s `click` output is `clicked`: write `(clicked)="..."` where a template wrote `(click)="..."` on a
  `tab-menu-button`. A `(click)` there no longer runs, since the item the user clicks is drawn in the menu, not in the
  button's element. Code that subscribed to `MenuButtonComponent.click` subscribes to `clicked`.
- `tab-nav-bar-button` has no `click` output: `(click)` on it is the element's own click, which now runs once per
  click, not twice, gets the `MouseEvent`, and doesn't run while the button is disabled. Code that subscribed to
  `NavBarButtonComponent.click` listens to the element's `click` event. A button without a `link` is a `<button>`, and a
  disabled one says so with `aria-disabled="true"`, not `disabled`: styles that matched `[disabled='true']` inside it
  match `[aria-disabled='true']`.
- `NavBarButtonComponent` has no `setExpandedInternal()` and `NavBarComponent` no `ngAfterContentInit`: each button reads
  its bar's `expanded` itself. Code that called them has nothing to call.
- `SnackService` is one for the app (`providedIn: 'root'`), and `TableauUiSnackModule` no longer provides it nor
  imports `RouterModule`; it was `providedIn: 'any'`, one per lazy route or page that injected it. A component opened
  with `openSnackComponent` gets its dependencies from the root injector: provide a service it needs in root, or put
  `SnackService` in the route's `providers` to keep one there.
- `TableauUiDialogModule` no longer provides `DialogService`, which is `providedIn: 'root'`: a page that imported the
  module, itself or through the select, menu or tooltip modules, had a dialog stack of its own, so one Escape closed
  the top dialog of each. A dialog's content gets its dependencies from the root injector, as it did when opened from
  the root's service.
- `ButtonToggleComponent` has no `selectedValueChange` member: that effect wrote `undefined` into `[(selectedValue)]`
  when the toggle was disabled, its option disabled or its options not there yet, and is gone. The `selectedValueChange`
  output of `[(selectedValue)]` is unchanged.
- `TabGroupComponent` has no `ngAfterViewInit` and `TabTreeComponent` no `ngAfterContentInit`: the tab group selects a
  tab whenever its tabs change, and the tree observes and measures after the first render in the browser, so both
  render on the server. A tab's `afterActivate` fires once its content is drawn, in the browser only, where it fired on
  the next animation frame. Code that called the methods has nothing to call.
- `tab-table` has no `$selectionMultiHeaderCheckboxSelected` input nor `$selectionMultiHeaderCheckboxSelectedChange`
  output: they were its header checkbox's own state, open to a binding by mistake, and the table overwrote what one
  set. Remove such a binding; the header checkbox follows `selectedRows`.
- `MonacoEditorComponent` has no `ngAfterViewInit`: Monaco loads, and the editor is created, after the first render in
  the browser, so a page with an editor can render on the server. Code that called the method has nothing to call.
- `ThemeService` no longer sets `--twc-font-size` on the root element, which no style read. Read
  `--twc-font-size-body`, which holds the same font size.
- The empty `styles/_lib-mixins.scss` and `styles/_tooltips.scss` are gone. Remove a
  `@use 'tableau-ui-angular/styles/lib-mixins'` or `@use 'tableau-ui-angular/styles/tooltips'`; neither held anything.
- `used-icons/scripts/update-icons.js` downloads with Node's own `fetch`, which on its own doesn't use `HTTP_PROXY` or
  `HTTPS_PROXY`, as `axios` did for an app that had it. Behind a proxy, set `NODE_USE_ENV_PROXY=1` beside
  `HTTPS_PROXY`, which Node 22 and 24 read in the versions this package supports, or set a mirror the network reaches
  in `TABLEAU_UI_ICONS_CSS_URL`.
- These say they can be `undefined` or `null` now, as they always could at run time: 0.1.129's typings and older
  lost `| undefined` and `| null`. Strict code that took them as always set no longer compiles (TS2322, TS2532):
  - `$value` and `valueChange` of `tab-single-select`, `tab-multi-select`, `tab-list-single-select`,
    `tab-list-multi-select` and `tab-radio-group`; `ButtonToggleComponent.$selectedValue` and `selectedValueChange`;
    `TooltipDirective.$tooltipContext` and `tooltipContextChange`; `DatePickerDirective.valueChange`;
  - what `MenuDirective.open()`, `AutoCompleteComponent.openDropdown()` and `MenuButtonGroupComponent.addMenuGroup()`
    return, `MenuButtonGroupComponent.menu` (`null` when no button menu holds the group), and the validators from
    `DateValidators.minDate()` and `maxDate()` (`null` for a valid date);
  - `DrawerContainerComponent.$leftDrawer` and `$rightDrawer`, and `ColumnDefDirective.$header`, `$headerTooltip` and
    `$cellTooltip`.

  Handle the empty case where code reads one (`menu.open()?.close()`, `select.$value() ?? fallback`), or widen the
  field or the handler parameter it goes into (`string | undefined`).

### Added

- `tab-virtualize`, in `tableau-ui-angular/virtualize`: a virtual-scroll container that loads its items in blocks, as
  the table does, with the data manager the two share, and `VirtualizeBaseComponent`, their base for an app's own
  virtual list, whose `load()`, `reload()` and `reset()` both use.
- `tab-chip`, in `tableau-ui-angular/chip`, and `tab-chip-control`, in `tableau-ui-angular/chip-control`: chips, and
  a form control that edits a list of them.
- `tab-icon`'s `label` input, the icon's name for screen readers.
- The typed forms' `registerFn` callbacks (`valueChange`, `childChange`, `childGroupChange`, `metaChange`,
  `enableChange`) take an optional `DestroyRef` last, which releases the callback when it is destroyed, such as a
  component's; without one a callback lives as long as the form.
- `used-icons/scripts/update-icons.js` reads the CSS API to ask from `TABLEAU_UI_ICONS_CSS_URL`, such as a mirror's;
  Google Fonts' `https://fonts.googleapis.com/css2` stays the default.

### Fixed

- The published typings are strict again: an optional input keeps `| undefined` in its type (0.1.129 and older lost
  it, so a strict-template app that bound `undefined` to one got TS2322).
- The date picker's `valueChange` and the tree node's `expandedChange` fire once per change, not twice.
- A select, a list or a chip control in `tab-form-field` is named by the field's label, through `aria-labelledby` on
  the element it focuses; a native `<select>` gets the label's `for`, and an input keeps an id the app gave it.
- `tab-checkbox` toggles once when its input itself is clicked, as assistive technology and a `<label for>` do; it
  toggled twice. Its partial state reads as mixed, its disabled state as disabled, and a click while it loads leaves
  the box as it was.
- `tab-radio-group` selects the option equal to a date the form writes, though the two are different objects.
- The library's icon-only buttons keep a name now that icons are hidden: the chip's remove, the select's clear, the
  snack's close, the arrow scroll's back and forward, and the expansion panel's, nav bar's and tree node's toggles. The
  dialog's header close is a button named Close, where it was a focusable icon.
- The typed forms: a change from `null` to `0`, or between other falsy values, reaches `$value()`, `value$` and
  `valueChange`; `valueChange` gets `null` when a control is cleared, not the old value. `alsoRunOnEnabled` runs a
  callback again when the control is enabled, not on every touched or dirty change, and `alsoRunOnDisabled` also runs
  it on an enabled control, first and on each change.
- A group's and an array's meta follow their children: `markAllAsTouched()` shows a child's error, and a removed row's
  error goes. An array's `$controls()` and `$childList()` notify on `push`, `insert` and `removeAt`, `valueChange`
  gets the rows its value holds, its raw value follows edits, its meta and its ancestors' follow a `push` or
  `removeAt` with `emitEvent: false`, and the array given to `fb.array` is left as it was.
- An `alwaysDisabled()` field stays disabled, its element too, after its form is disabled and enabled again; `enable()`
  leaves it disabled.
- `submitted$` emits when the form bound with `[formGroup]` is submitted; `valueIsDefault` is true from the start; and
  `childChange` and `formControlValue` take an optional field's `FC<T | undefined>` under strict templates.
- `ThemeService`, `tab-form-field` and `tab-arrow-scroll` render on the server: they touch the window, storage and
  observers only in the browser, so a page with them can be prerendered.
- The select, the autocomplete and the menus follow their WAI-ARIA patterns, so a screen reader announces each option
  or item as the user arrows to it. A select is a combobox whose dropdown is a listbox of options, with
  `aria-expanded`, `aria-controls`, `aria-activedescendant` and `aria-selected`; an input with `tabAutoComplete` is a
  combobox with list autocomplete; `tab-menu-button-group` is a menu of menu items, each submenu a menu named by its
  item, and an element with `attachedMenu` says whether its menu is open (`aria-expanded`) and, for a button menu,
  that it opens one (`aria-haspopup="menu"`).
- `tab-single-select` marks the option of its value as selected; it marked none. After `reset()` it shows no clear
  button, and a disabled select reads as disabled, not hidden.
- A select's dropdown closes when the select is destroyed, as on a route change, and a search box in it takes spaces;
  a space closed it. When the dropdown closes with focus in it, on Escape, Enter or a pick from its search box, focus
  goes back to the select, as it does after the clear button, so the select is touched only when the user leaves it.
- A dropdown, the autocomplete's suggestions and a menu follow the element they open from when the page or a container
  scrolls, as they did on a resize.
- `tab-chip-control`: a `null` write (a new `FormControl`, `reset()`) is no chips; it threw and lost every later
  chip. A form's first write keeps its chips, removing chips removes them all, a change made while `getValuesByKeys`
  waits is kept, and Backspace shows the chip it highlights when its key is an object `keyComparer` matches. A failed
  `getValuesByKeys` goes to the app's `ErrorHandler` and stops the spinner, and the next one still runs. The control no
  longer changes the arrays it is given. Values bound on the first render, or set with the keys, show; and values set
  while keys are being looked up keep those keys, whose chips come when the lookup answers.
- The date picker shows the `value` bound to it, and its form's value in `$value()`; it never wrote `[value]` to the
  element. A form's `reset()` clears a half-typed date. `<input type="datetime-local">` stays a date and time input,
  and `type="datetime-local"` type-checks; it became a date input.
- The autocomplete writes a pick into the input its suggestions are open for, not every input that shares it, and lets
  go of a removed input. Enter with no suggestion highlighted closes them and goes on, so a search form submits; a
  read-only input gets no suggestions; they follow the input when it moves; each opening starts with nothing
  highlighted; and a label with no id, or one around the input, names the listbox too.
- The menus: a closed submenu leaves the screen; a group no longer adds a subscription to its menu on each open; the
  arrows, Enter and Space no longer scroll the page under a menu; an item that is loading is disabled, for the mouse
  too; a menu whose items are still loading no longer throws; a menu closes when its owner is destroyed;
  `autoOpenClose` can be turned off; focus moving onto an item, as a screen reader may move it, no longer closes the
  submenu that holds it; and items that arrive while the menu has focus get the highlight, on the first of them.
- The select, the chip control, the date picker and the menus render on the server, so a page with them can be
  prerendered.
- Dialogs: a closed dialog destroys its header's close icon, which leaked with each dialog. A modal is centred by its
  height, which was taken from its width, and never placed above or left of the screen, so a large one keeps its header
  on it; it keeps `minWidth` and `minHeight`. Escape closes only the top dialog, and still closes a modal while a
  tooltip shows over it. A confirmation template gets its context. Destroying the app with dialogs open closes them,
  so their backdrops and listeners go and the page's tab order comes back.
- Snacks are announced: each is in a live region, polite, or assertive for an error. A closed snack is destroyed, so
  its component's `ngOnDestroy` runs; it was only detached. The action is a button, which no longer navigates or needs a
  router, and the close is a button named Close. A snack waits while the pointer or focus is on it, then goes on
  counting from where it was.
- `tab-accordion` keeps one panel open after a panel leaves it; it kept the others open once any had gone. It no
  longer claims to be a tablist, and each panel's toggle is named by the panel's title, or Details without one, and
  says whether it is open (`aria-expanded`); it was Expand or Collapse on every panel.
- `tab-button-toggle` keeps the value bound to it while it is disabled, on a disabled option, or before its options
  come, and the arrow keys leave a disabled one alone; it cleared the value, and the arrows changed it. A template hint
  shows its content, not "[object Object]".
- The nav bar's buttons follow its `expanded`, set by the app or by its toggle, buttons added later included. A
  collapsed button keeps its text for screen readers, out of sight, so it has a name; the active page's button is
  `aria-current="page"`; its toggle is named Menu and says whether the bar is open (`aria-expanded`); and a button
  without a link is a button the keyboard reaches.
- `tab-group` selects the first tab of tabs that come later, and the last one when the selected last tab closes; it
  showed none. Selecting a tab scrolls the strip of tabs only: on load it scrolled the page down to the tabs.
- A form control on `tab-tree-node` fails with Angular's own "no value accessor" error: the node offered forms one it
  couldn't keep, which threw `writeValue is not a function`.
- `DialogService`, `SnackService`, `tab-group` and `tab-tree` render on the server, so a page with them can be
  prerendered. A dialog or a snack opened there shows nothing, since the browser renders the page again, and
  `openConfirmationMessageDialog` and `openConfirmationTemplateDialog` resolve `false` at once, so a guard or a
  resolver that awaits one doesn't hold the render.
- The table and `tab-virtualize` show their rows in Firefox. They read a row's size from a copy of its computed style,
  which Firefox leaves empty, so every table and virtual list there showed "No data available".
- A reset of the table or `tab-virtualize` that a newer one overtakes leaves the rows to the newer one: `reset(true)` on
  a scrolled table, or two resets in a row, ended on "No data available", and an answer to a request the newer reset
  replaced set the row count. A sort or other input changed while the first load runs is loaded; it was dropped, so a
  header clicked then showed its arrow over rows in the old order.
- Cancelling a load, as two quick sorts do, logs no error and reaches no `ErrorHandler`, and a destroyed table or
  `tab-virtualize` cancels its loads.
- With row selection, a click on a link, a button, a checkbox, a `tab-button-toggle` or another control in a cell, one
  with a WAI-ARIA widget role included, is that control's own: it works, and selects no row. Each row's selection
  checkbox toggles; the table cancelled every click in a row, its checkbox's included.
- The app's `getRowKey` and `cellClass` get only loaded rows, never a loading row's empty placeholder, and a click on a
  loading row selects nothing. The table no longer changes the app's own sort objects, on a shift-click, nor its
  `selectedRows` Map, on a checkbox or a ctrl-click: it emits new ones.
- Under a border-box reset, such as Tailwind's or Bootstrap's, each table cell is as wide as its header; cells were
  narrower by their padding, and the columns drifted apart.
- A row is measured inside the table or `tab-virtualize`, so a row height in `em` follows the font size there; with
  another font size in the table, its rows jumped as it scrolled. `reload()` measures the row again, so a font changed
  since shows too. Text clamping follows `dataRowCss` when it changes, and a clamped cell shows its text when the
  row's line height is no pixel value, such as `normal`; the clamp took a height of 0.
- `load()`, `reload()` and `reset()` called from an app's effect add nothing to what the effect tracks: the effect ran
  again when the table's inputs changed. Scrolling a table or `tab-virtualize` with `FullDataOptions` keeps no
  listener for each block it drops.
- Changing the table's `selectionOptions` no longer loads its data again. The header's select-all checkbox is checked
  when the selection holds every row, once the full load answers; it stayed partial.
- `tab-list-single-select` and `tab-list-multi-select` follow WAI-ARIA's listbox pattern: a listbox of options,
  multi-selectable for the multi-select, each option with `aria-selected`, and `aria-activedescendant` naming the
  option the keyboard or the pointer highlights, so a screen reader announces each one. A disabled list takes no focus,
  not even from a click, and is never marked touched; its options still take the pointer and the wheel.
- `tab-table` and `tab-virtualize` render on the server: `load()` and `reload()` measure and load in the browser only,
  and return `false` on the server, and the table's column widths start observing after the first render, so a page
  with them can be prerendered.
- A form's write to `tab-monaco-editor` (`setValue`, `patchValue`, `reset()`) no longer comes back as the user's
  change: the form stays pristine and emits `valueChanges` once, where Monaco's report of the new text marked it dirty
  and emitted it again.
- `tab-monaco-editor` is read-only while its form control is disabled, and so is its text box, which a screen reader
  reads; it took typing.
- After a change of the Monaco editor's `options`, typing no longer rebuilds the editor on each keystroke, which lost
  the cursor and the undo history, and the one rebuild keeps the undo history.
- A change of the Monaco editor's `uri` disposes the old document's model, as destroying the editor does, unless
  `disposeModelOnDestroy` is `false`; each one stayed in Monaco's models for the page.
- An editor destroyed while Monaco still loads is not created once it has loaded; it was, with a model that leaked.
- When Monaco fails to load, its `loader.js` or its `editor.main`, as when the app serves nothing at `monaco-edit/vs`,
  the editor that started the load reports it to the app's `ErrorHandler`, once, and the next editor fetches it again.
  Every editor stayed blank, and nothing said why.
- `tab-monaco-editor` renders on the server: it loads Monaco after the first render, in the browser only, so a page with
  an editor can be prerendered.
- `ThemeService.$theme`, and a `computed` that reads it, update on `setColorMode()` and `setFontSize()`, and `reset()`
  goes back to the default after a change. The setters changed the theme object in place, so nothing that read
  `$theme()` updated, and with nothing stored they changed the default too.
- A stored theme that is not JSON or not a theme, or storage the browser blocks, gives the default theme. It threw, and
  every component that injects `ThemeService`, the date picker and the Monaco editor among them, failed.
- Dark mode reaches the page's own background, its scrollbars and the variables read outside the body:
  `ThemeService` sets `dark-mode` and `color-scheme` on the root element as well as the body, and the dark theme's
  variables are set on `:root.dark-mode`, where they were set on `body.dark-mode` alone. An app that sets the class on
  the body itself keeps the dark theme there.
- Screens of 120 dpi or less get the low-DPI font. The rule read `var(twc-low-dpi-font-family)`, without its dashes,
  which browsers drop.
- `ClipboardService` copies and pastes in Firefox and Safari. Their permission query rejects the clipboard's names, and
  that failed every copy and paste; a query that fails now counts as unknown, and the clipboard call itself decides.
- A denied clipboard read says so; it showed the message for a denied write.
- `used-icons/scripts/update-icons.js` runs in an app without `axios`, which it required but the package never
  declared: it downloads with Node's own `fetch`. In an app without `typescript` it says how to install it.
- `styles/fonts/downloadFonts.js` exits 1 when a font file fails to download, names the files that failed, and keeps
  the copy the folder had of each, with no empty or partial file: it writes `<file>.part` and moves it in place once
  complete. It left a 0-byte file and reported success, and an answer that broke off stopped it.
- An `<a button>` without an `href` runs its click on Enter, as on Space. The browser does nothing on Enter for an
  `<a>` without one, so a keyboard user could only use Space; one with an `href` still follows it as a link does.
- A disabled or loading `<a button>` runs no click, from a screen reader, the keyboard or code, and says it is
  disabled (`aria-disabled`). `disabled` means nothing on an `<a>`: it read as an enabled button and ran the app's
  `(click)`.
- The `resizeWatcher` directive renders on the server: it observes after the first render, in the browser only. It
  created its `ResizeObserver` while rendering, which the server lacks, so a page with it could not prerender.
- The `formArrayControls` pipe takes a typed form array (`FA<T>`) and gives its rows as `FG<T>`. With strict
  templates, Angular's default, `form.controls.rows | formArrayControls` failed to compile.
- The `formError` pipe on a group or an array finds the error on whichever child has it. It looked at the first
  child only, and gave `null` when that child had no such error.
- A control's `validatorFn` functions return the control, as `metaFn`'s do, so calls chain. They returned Angular's
  own control, so a call after them, such as `.metaFn.markAsTouched()`, threw. A call chained after them now runs the
  control's own `updateValueAndValidity(...)` and `reset(...)`, which honour their arguments: before, Angular's ran,
  updated the ancestors whatever the arguments said, and marked nothing. The declared type was already the control's,
  so an app's code compiles as before.
- The table's header tooltip says "Shift + Click to add to multi-sort"; it said "add add".
- The README's example compiles: it imports `TableauUiButtonModule` from `tableau-ui-angular/button`. It imported
  from the root, which exports nothing, and named a `TableauUiAllModule` that doesn't exist.
- `Add-Benton-Sans.md` runs the font script from `node_modules/tableau-ui-angular/styles/fonts/`, where the package
  has it, lists the Light files `font-import` loads, and uses the styles as `libStyles` for `font-import`.

### Changed

- The licence is MIT. 0.1.129 and earlier stay AGPL-3.0-only.
- The menu button and the form group pipe no longer write debug logs to the console, which they did in production.
- The package's description says it is not affiliated with or endorsed by Tableau or Salesforce, as the README now
  does. The README is short: install, a first button, the docs site, support, the licence.
- The package declares no `engines`, so Yarn classic installs it on every Node version Angular 22 supports.
- `ThemeService` stores the theme under `tableau-ui-angular:theme`, so it neither reads nor overwrites another
  script's `theme-config`. It reads `theme-config`, its key before, when the new one holds nothing, so a user keeps the
  theme they chose.
- `ThemeService`'s docs say to call `initialize()` once when the app starts, and what it does; until then the page
  keeps the light theme at the default font size.
- `ClipboardService` is one for the app (`providedIn: 'root'`), and `TableauUiClipboardModule` no longer provides it:
  it was `providedIn: 'any'`, one per lazy route or page that injected it. It holds no state, so nothing else changes.

## 0.1.129 (2026-10-28)

### Security

- The dialog title is shown as text. It was set as HTML, so a title built from input, such as a confirmation that
  names the item it deletes, could run script in the session of whoever opened the dialog
  ([GHSA-pf6h-4mjg-cmrw](https://github.com/serionist/tableau-ui-angular/security/advisories/GHSA-pf6h-4mjg-cmrw)).
  Every version before 0.1.129 is affected.

### Fixed

- The Monaco editor keeps what the user types. Each keystroke set the text again, which put the cursor back at the
  start and cleared the undo stack: typing "abc" gave "cba".
- A form reset clears the Monaco editor: `writeValue(null)` threw and kept the old text.
