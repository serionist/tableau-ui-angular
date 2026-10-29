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
- `DatePickerDirective.$value` and `TabTreeNodeComponent.$expanded` are writable signals, no longer models, and their
  inputs' class members are `$valueInput` and `$expandedInput`. `[(value)]` and `[(expanded)]` bind as before, and
  `()` and `.set()` work as before; code that typed them as `ModelSignal` or subscribed to them types them as
  `WritableSignal` and listens to `valueChange` or `expandedChange`.
- `tab-checkbox` and `tab-radio-group` emit `(valueChange)` on each toggle or pick by the user, and never when a form
  writes their value (on init, `setValue`, `reset`). Code that followed the form's value through `(valueChange)`
  subscribes to the control's `valueChanges` instead.
- `CheckboxComponent.$value` and `RadioGroupComponent.$value` are writable signals, no longer models; their inputs'
  class members are `$valueInput`, and `valueChange` is an output of its own. `[(value)]` binds as before, and `()`
  and `.set()` work as before; code that typed them as `ModelSignal` or subscribed to them types them as
  `WritableSignal` and listens to `valueChange`.
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

### Added

- `tab-virtualize`, in `tableau-ui-angular/virtualize`: a virtual-scroll container that loads its items in blocks, as
  the table does, with the data manager the two share.
- `tab-chip`, in `tableau-ui-angular/chip`, and `tab-chip-control`, in `tableau-ui-angular/chip-control`: chips, and
  a form control that edits a list of them.
- `tab-icon`'s `label` input, the icon's name for screen readers.
- The typed forms' `registerFn` callbacks (`valueChange`, `childChange`, `childGroupChange`, `metaChange`,
  `enableChange`) take an optional `DestroyRef` last, which releases the callback when it is destroyed, such as a
  component's; without one a callback lives as long as the form.

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
  snack's close, the dialog's close, the arrow scroll's back and forward, and the expansion panel's, nav bar's and tree
  node's toggles.
- The typed forms: a change from `null` to `0`, or between other falsy values, reaches `$value()`, `value$` and
  `valueChange`; `valueChange` gets `null` when a control is cleared, not the old value. `alsoRunOnEnabled` runs a
  callback again when the control is enabled, not on every touched or dirty change, and `alsoRunOnDisabled` also runs
  it on an enabled control, first and on each change.
- A group's and an array's meta follow their children: `markAllAsTouched()` shows a child's error, and a removed row's
  error goes. An array's `$controls()` and `$childList()` notify on `push`, `insert` and `removeAt`, `valueChange`
  gets the rows its value holds, its raw value follows edits, and the array given to `fb.array` is left as it was.
- An `alwaysDisabled()` field stays disabled, its element too, after its form is disabled and enabled again; `enable()`
  leaves it disabled.
- `submitted$` emits when the form bound with `[formGroup]` is submitted; `valueIsDefault` is true from the start; and
  `childChange` and `formControlValue` take an optional field's `FC<T | undefined>` under strict templates.
- `ThemeService`, `tab-form-field` and `tab-arrow-scroll` render on the server: they touch the window, storage and
  observers only in the browser, so a page with them can be prerendered.

### Changed

- The menu button and the form group pipe no longer write debug logs to the console, which they did in production.
- The package declares no `engines`, so Yarn classic installs it on every Node version Angular 22 supports.

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
