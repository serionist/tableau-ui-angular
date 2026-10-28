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

### Added

- `tab-virtualize`, in `tableau-ui-angular/virtualize`: a virtual-scroll container that loads its items in blocks, as
  the table does, with the data manager the two share.
- `tab-chip`, in `tableau-ui-angular/chip`, and `tab-chip-control`, in `tableau-ui-angular/chip-control`: chips, and
  a form control that edits a list of them.

### Fixed

- The published typings are strict again: an optional input keeps `| undefined` in its type (0.1.129 and older lost
  it, so a strict-template app that bound `undefined` to one got TS2322).
- The date picker's `valueChange` and the tree node's `expandedChange` fire once per change, not twice.

### Changed

- The components no longer write debug logs to the console: the chip control, the menu button and the form group
  pipe wrote them in production.
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
