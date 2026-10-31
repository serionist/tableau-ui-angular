# tableau-ui-angular

Tableau-style components for Angular 22: buttons, form controls, selects, a virtual table, dialogs, snacks, menus and
more, one entry point per folder.

Not affiliated with or endorsed by Tableau or Salesforce.

## Install

The package is on npm; an Angular 22 app already has every peer but Monaco.

```bash
npm install tableau-ui-angular
```

| Peer                                                                    | Range                                           |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| `@angular/common`, `@angular/core`, `@angular/forms`, `@angular/router` | `^22.0.0`                                       |
| `rxjs`                                                                  | `^7.4.0`                                        |
| `monaco-editor`                                                         | `^0.52.2`, only for `tableau-ui-angular/monaco` |

## A first button

Use the styles once, in the app's `styles.scss`, then import a component folder's module where you use it. The styles
are SCSS: an app made with CSS renames `src/styles.css` to `src/styles.scss`, there and in `angular.json`.

```scss
@use 'tableau-ui-angular/styles/lib-styles';
```

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';

@Component({
  selector: 'app-first-button',
  imports: [TableauUiButtonModule],
  template: `<button color="primary" (click)="$count.set($count() + 1)">Clicked {{ $count() }} times</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstButtonComponent {
  protected readonly $count = signal(0);
}
```

- Each folder is an entry point, `tableau-ui-angular/<folder>`. A component folder has a module for its components,
  such as `TableauUiButtonModule` in `tableau-ui-angular/button`. The root, `tableau-ui-angular`, exports nothing.
- The fonts, Roboto or Tableau's Benton Sans, and the icons are on the docs site's getting started page.

## Docs

The docs site, [serionist.github.io/tableau-ui-angular](https://serionist.github.io/tableau-ui-angular/), shows the
components running.

- Getting started: install, the modules, the styles, the fonts and the icons.
- Theming, server-side rendering, and a page per component.
- The buttons, checkbox, chips, clipboard, date picker, dialogs, drawer, expansion panel, form fields, menu, Monaco,
  nav bar, radio groups, select, snackbar and table pages show each sample's source; the other pages are next.

## Support

The package follows Angular's majors.

|            |                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Angular    | 22: the peers are `^22.0.0`                                                                              |
| Node       | Angular 22's range, `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`, to build the app and run the shipped scripts |
| Angular 20 | `0.1.129`, the last 0.1 release, which gets no more fixes                                                |

## Licence

MIT, in [LICENSE](https://github.com/serionist/tableau-ui-angular/blob/main/LICENSE). 0.1.129 and earlier are AGPL-3.0-only.

## Contributing

Issues and pull requests are welcome.

- [CONTRIBUTING.md](https://github.com/serionist/tableau-ui-angular/blob/main/CONTRIBUTING.md): how to build, test
  and open a pull request.
- [SECURITY.md](https://github.com/serionist/tableau-ui-angular/blob/main/SECURITY.md): how to report a vulnerability
  privately.
