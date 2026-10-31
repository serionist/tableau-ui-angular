import { ICONS_SCRIPT } from '../getting-started-page/commands';

// What the icons page tells an app to run and write. docs-pages.spec.ts checks each against the script, by its path in
// the library, and against the docs site's own styles.scss and package.json

// The used-icons script's environment variable for another CSS API, and the one it asks without it
export const ICONS_CSS_URL_VARIABLE = 'TABLEAU_UI_ICONS_CSS_URL';
export const ICONS_CSS_API = 'https://fonts.googleapis.com/css2';

export const ICONS_SCRIPTS = `{
  "scripts": {
    "icons": "node node_modules/tableau-ui-angular/${ICONS_SCRIPT} src/icons.ts public/icons",
    "prebuild": "npm run icons",
    "icons:watch": "npm run icons && chokidar src/icons.ts -c \\"npm run icons\\"",
    "start": "concurrently \\"ng serve\\" \\"npm run icons:watch\\""
  }
}`;
export const ICONS_TOOLS_INSTALL = 'npm install --save-dev chokidar-cli concurrently';
export const ICONS_CSS_USE = "@use '../public/icons/material-icons.css';";

export const MATERIAL_SYMBOLS_INSTALL = 'npm install material-symbols';
export const MATERIAL_SYMBOLS_USES = ["@use 'material-symbols/rounded';", "@use 'material-symbols/outlined';", "@use 'material-symbols/sharp';"];
