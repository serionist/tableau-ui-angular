// The commands the getting started page shows. Each runs a script the package ships, by its path in the package;
// docs-pages.spec.ts reads each script at that path in the library and checks ng-package.json ships it there
export const FONTS_SCRIPT = 'styles/fonts/downloadFonts.js';
export const ICONS_SCRIPT = 'used-icons/scripts/update-icons.js';

export const FONTS_COMMAND = `node node_modules/tableau-ui-angular/${FONTS_SCRIPT} https://your-tableau-server public/fonts`;
export const ICONS_SCRIPTS = `{
  "scripts": {
    "icons": "node node_modules/tableau-ui-angular/${ICONS_SCRIPT} src/icons.ts public/icons",
    "prebuild": "npm run icons"
  }
}`;
