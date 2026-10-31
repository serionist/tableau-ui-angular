import { ICONS_SCRIPT } from '../getting-started-page/commands';
import iconsTs from './snippets/icons.ts?source' with { loader: 'text' };

// What the icons page tells an app to run and write. docs-pages.spec.ts checks each: the scripts against getting
// started's and the site's own, the tools against the site's devDependencies and their packages' binaries, the class,
// the variable, the API and the CSS file against the used-icons script, and the styles lines against the site's
// styles.scss and the material-symbols package

// The class src/icons.ts declares, which the script reads by its name
export const ICONS_CLASS = /export class (\w+) extends UsedIcons/.exec(iconsTs)?.[1] ?? '';

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
// The CSS file the script writes, which that line uses
export const ICONS_CSS_FILE = /\/([\w.-]+\.css)';$/.exec(ICONS_CSS_USE)?.[1] ?? '';

export const MATERIAL_SYMBOLS_INSTALL = 'npm install material-symbols';
export const MATERIAL_SYMBOLS_USES = ["@use 'material-symbols/rounded';", "@use 'material-symbols/outlined';", "@use 'material-symbols/sharp';"];
