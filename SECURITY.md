# Security

tableau-ui-angular's components run inside other people's apps, in their users' browsers, so a flaw in one reaches
every app that uses it. Versions before 0.1.129 set the dialog title as HTML ([GHSA-pf6h-4mjg-cmrw][advisory]).

## Reporting

Report it privately through a [security advisory][report], never in an issue, a pull request or a discussion: anyone
can read those. Say what an attacker can do and what they need first, how to reproduce it (a StackBlitz or a small
repository helps), and which versions of tableau-ui-angular and Angular you tested, in which browser. You'll get an
answer within a week.

## What counts

- Script from input running in an app user's session: a component that renders a text, a value or a label it is
  given as HTML, or puts a URL from input into a link or a source past Angular's sanitizing.
- The Monaco editor component loading script from anywhere but the app's own `monaco-edit/vs` folder.
- The scripts apps run, `styles/fonts/downloadFonts.js` and `used-icons/scripts/update-icons.js`: a file written
  outside the folder they were given, or code run from what they download.
- A published package with something this repository doesn't build into it: a secret, an install script, a file
  nobody committed.
- This repository's workflows: one that hands a pull request's code a write token or a secret.

What does not count: an app that marks its own input as safe (`bypassSecurityTrust*`) and passes it in; a flaw in
Angular or `monaco-editor` itself, which goes to them; an `npm audit` finding in a dev tool that never reaches the
published package.

## Supported versions

| Version            | For             | Fixes                                                                      |
| ------------------ | --------------- | -------------------------------------------------------------------------- |
| The latest release | Angular 22      | Every fix                                                                  |
| 0.1.129            | Angular 20 apps | None after 0.2.0, with no backports: move the app to Angular 22 and update |
| Before 0.1.129     |                 | None: update to 0.1.129 at least                                           |

0.2.0 is the first release for Angular 22. Before 1.0, only the latest release gets fixes.

[advisory]: https://github.com/serionist/tableau-ui-angular/security/advisories/GHSA-pf6h-4mjg-cmrw
[report]: https://github.com/serionist/tableau-ui-angular/security/advisories/new
