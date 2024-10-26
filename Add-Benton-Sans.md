# Adding Benton Sans (Tableau) font

Before adding Tableau font (**Benton Sans Book**), ensure you own a valid license, as it is proprietary.
    
Designate a public folder to host your webfonts, e.g., `public/fonts` (`/fonts` URL).

1. Add the Benton Sans webfont files into the `public/fonts` folder:

    #### If you own a Tableau Server
    Run the following script from the root of your project:
    ```
    node tableau-ui-angular/styles/fonts/downloadFonts.js https://[your-tableau-server].com public/fonts
    ```
    This will download all the required fonts from the Tableau Server
    #### If you don't own a Tableau Server
    Manually place the following files into the `public/fonts` folder:
    - BentonSans-Book.woff
    - BentonSans-Book.woff2
    - BentonSans-Book_Italic.woff
    - BentonSans-Book_Italic.woff2
    - BentonSans-Medium.woff
    - BentonSans-Medium.woff2
    - BentonSans-SemiDemi.woff
    - BentonSans-SemiDemi.woff2
    - BentonSans-SemiDemi_Italic.woff
    - BentonSans-SemiDemi_Italic.woff2

2. Add the following line into your `styles.scss` file:
    ```
    # You should already have this line
    @import 'tableau-ui-angular/styles/lib-styles';
    # Add this line to import the Benton Sans font from the /fonts URL
    @include font-import('/fonts');
    ```

    This sets up the application to pull the Benton Sans font files from the `/fonts` URL, which corresponds to your `public/fonts` folder.