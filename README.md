# Tableau UI Angular

Tableau UI Angular is a third-party component library that brings Tableau-style components to Angular 18.

## Getting started
To install the library, run the following command:

```bash
npm install tableau-ui-angular
```

## Components & Samples
A web app containing all components, guides, and samples is hosted [on GitHub Pages](https://serionist.github.io/tableau-ui-angular/). Note that the web app does not display the underlying usage code. To understand how to use the components, you will need to browse the source code.

To explore the code locally:

1. Clone the repository:
    ```bash
    git clone https://github.com/serionist/tableau-ui-angular.git
    ```
2. Install dependencies
    ```bash
    npm install
    ```
3. Start the app:
    ```bash
    npm start
    ```

Requires Node 22.

The hosted version of this sample app does not use the official Tableau font (**Benton Sans Book**), as its proprietary. If you host your own version of it and you own a Tableau Server, you can import the Tableau fonts by running:
```
node projects/component-library/styles/fonts/downloadFonts.js https://[your-tableau-server].com projects/test-app/public/font
```
If you don't do this step, the sample site will fall back to Roboto or Arial fonts (the hosted sample site is also using these fonts).

## Using Tableau UI Angular

Follow this example to add a Tableau button to your site (using SCSS stylesheets):

1. Install the package
    ```bash
    npm install tableau-ui-angular
    ```
2. In `styles.scss`, import the library styles:
    ```scss
    @import 'tableau-ui-angular/styles/lib-styles';
    ```
3. (Optional) If you own a license for the Tableau font (**Benton Sans**), follow [this guide](Add-Benton-Sans.md) to import it.
4. (Optional) To use `Roboto` as a fallback font, add this line to your `styles.scss`:
    ```
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
    ```
5. Update your `app.component.ts`, import `TableauUiButtonModule`:
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
    **Note:** You can use the `TableauUiAllModule` to import all components.

6. In `app.component.html`,add the button:
    ```
    <button color="primary" [loading]="false" type="button" [disabled]="false">This is a primary Tableau Button</button>
    ```
    **NOTE:** the `color`, `loading`, `type` and `disabled` attributes are optional.




## Host locally using npm linking

1. Run `npm run dev:link` from the root project folder
2. Go to your consuming project (which already has `tableau-ui-angular` installed probably) and run:
    - `npm unlink tableau-ui-angular` (to be safe)
    - `npm link tableau-ui-angular`
    - `cd node_modules/tableau_ui_angular`
    - `npm install` to install required linked packages
    - `cd ../..`
3. It will replace the package files from npm from the ones you are hosting locally with `npm run dev:link`