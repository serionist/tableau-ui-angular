# Tableau UI Angular

Tableau UI Angular is a third party component library to bring Tableau style components straight into Angular 18.

## Getting started
`npm install tableau-ui-angular`

## Components & Samples
A web app containing all components, guides and samples is hosted [on GitHub Pages](https://serionist.github.io/tableau-ui-angular/).

The app does not show the code behind examples; you need to browse the source code for the app to understand how to use the components.

For this reason, it's recommended to clone this repository and host your own version of sample app:

1. `git clone https://github.com/serionist/tableau-ui-angular.git` or `git clone git@github.com:serionist/tableau-ui-angular.git`
2. `npm install` from the project directory
3. `npm start` from the project directory

You will need Node 22.

The hosted version of this sample app does not use the official Tableau font (**Benton Sans Book**), as its proprietary. If you host your own version of it and you own a Tableau Server, you can import the Tableau fonts by running:
```
node projects/component-library/styles/fonts/downloadFonts.js https://[your-tableau-server].com projects/test-app/public/font
```
If you don't do this step, the sample site will fall back to Roboto or Arial fonts (the hosted sample site is also using these fonts).

## Using Tableau UI Angular

This example shows you how to get started with the extension and add a simple Tableau button to your site.

Using this library assumes you use SCSS stylesheets.

1. Add the package to your project by running `npm install tableau-ui-angular`
2. Open `styles.scss` and add the following code to pull in the styles associated with the library:
    ```
    @import 'tableau-ui-angular/styles/lib-styles';
    ```
3. (Optional) If you own a license for the Tableau font (**Benton Sans**), follow [this guide](Add-Benton-Sans.md) to import it.
4. (Optional) If you don't use **Benton Sans**, add the following line to your `styles.scss` file to import `Roboto`, which is the default fallback font:
    ```
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
    ```
5. Update your `app.component.ts` to import `TableauUiButtonModule`:
    ```
    import { Component } from '@angular/core';
    import { RouterOutlet } from '@angular/router';
    import { TableauUiButtonModule } from 'tableau-ui-angular';

    @Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, TableauUiButtonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
    })
    export class AppComponent {
    title = 'tableau-ui-angular-sample';
    }

    ```
    **Note:** You can add the `TableauUiAllModule` instead of the `TableauUiButtonModule` if you wish to add all Tableau Controls instead of just the button. This results in a more monolithic import, and doesn't allow you to granually import only what's needed.

6. Update your `app.component.html` to include the following:
    ```
    <button color="primary" [loading]="false" type="button" [disabled]="false">This is a primary Tableau Button</button>
    ```
    **NOTE:** the `color`, `loading`, `type` and `disabled` attributes are provided for reference, they are all optional.

7. ???
8. Profit



