# Adding Benton Sans (Tableau) font

Before adding Tableau font (**Benton Sans Book**), make sure that you own a valid license for it, as it's proprietary. 
    
Before starting, designate a public folder to host your webfonts in. In this example, I will use the `public/fonts` folder (`/fonts` URL).

1. Add the Benton Sans webfont files into the `public/fonts` folder:

    #### If you own a Tableau Server
    Run the following script from the root of your project:
    ```
    node tableau-ui-angular/styles/fonts/downloadFonts.js https://[your-tableau-server].com public/fonts
    ```
    This will download all the required fonts from the Tableau Server
    #### If you don't own a Tableau Server
    Place the following files into the `public/fonts` folder:
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

    This sets up the application to pull in the Benton Sans font files from the `/fonts` URL, which translates to your `public/fonts` folder.