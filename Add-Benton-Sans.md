# Adding Benton Sans, the Tableau font

Benton Sans is Tableau's font, which needs a licence. Without it the text falls back to Roboto, when the app loads it,
then Arial.

1. Put its webfont files in a public folder, such as `public/fonts`, which the app serves at `/fonts`.
2. Load them from `styles.scss`, after the library's styles.

## 1. The files

A Tableau Server you own has them. Run the script the package ships, from the app's root, with the server's address
and the folder:

```bash
node node_modules/tableau-ui-angular/styles/fonts/downloadFonts.js https://your-tableau-server public/fonts
```

Without a server, put these 12 files in the folder yourself:

| Weight          | Files                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Light           | `BentonSans-Light.woff`, `BentonSans-Light.woff2`                     |
| Book            | `BentonSans-Book.woff`, `BentonSans-Book.woff2`                       |
| Book italic     | `BentonSans-Book_Italic.woff`, `BentonSans-Book_Italic.woff2`         |
| Medium          | `BentonSans-Medium.woff`, `BentonSans-Medium.woff2`                   |
| SemiDemi        | `BentonSans-SemiDemi.woff`, `BentonSans-SemiDemi.woff2`               |
| SemiDemi italic | `BentonSans-SemiDemi_Italic.woff`, `BentonSans-SemiDemi_Italic.woff2` |

## 2. The styles

`font-import` takes the URL the folder is served at, `/fonts` for `public/fonts`:

```scss
@use 'tableau-ui-angular/styles/lib-styles' as libStyles;

@include libStyles.font-import('/fonts');
```

The docs site's getting started page shows the whole `styles.scss`, with the Roboto fallback and the icons.
