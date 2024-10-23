# TableauComponentLibrary

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.6.


## Publishing a new version to npm

0. Login to npm with `npm login` if required
1. Update the version in `component-library/package.json`
2. Commit it and `git tag -l "[version]"`
3. `npm run publish`

## Consume locally in another project
1. `ng build component-library -c=production --watch`
2. In a new terminal, `cd dist/component-library` and `npm link`
3. In the consuming project, `npm link tableau-ui-angular`

NOTE: If you get an error similar to this with the linked library:
```
Property '__@ɵINPUT_SIGNAL_BRAND_WRITE_TYPE@7532' does not exist on type 'InputSignal<"error" | "primary" | undefined>'. Did you mean '__@ɵINPUT_SIGNAL_BRAND_WRITE_TYPE@947'
```
It's caused by different versions of @angular/core installed for your two projects.
This can happen if:
1. There are different @angular/* package versions defined in the `package.json` for both projects
    In this case, update them to the same version. It can be provided as a version range

2. The provided @angular/* packages have version ranges defined (starting with ~ or ^, etc)
    In this case, delete the `package-lock.json` and `node-modules` from both projects, and run `npm install` again.



## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
