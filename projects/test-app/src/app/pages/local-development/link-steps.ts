// What the local development page tells a developer to run and write: the steps npm run dev:link prints.
// docs-pages.spec.ts finds each in scripts/link-info.js, which prints them, and the script in the root package.json

export const DEV_LINK = 'npm run dev:link';

export const ANGULAR_JSON = `{
  "projects": {
    "[your-app]": {
      "architect": {
        "build": {
          "options": {
            "preserveSymlinks": true
          }
        },
        "serve": {
          "options": {
            "prebundle": {
              "exclude": ["tableau-ui-angular"]
            }
          }
        }
      }
    }
  }
}`;

export const TSCONFIG_JSON = `{
  "compilerOptions": {
    "paths": {
      "tableau-ui-angular": ["./node_modules/tableau-ui-angular"]
    }
  }
}`;

export const LINK_INSTALL = 'npm install --save-dev link';

// The packages the npx link line links from the library's checkout, after the library's build
export const LINKED_PACKAGES = ['@angular/common', '@angular/core', '@angular/forms', '@angular/router', 'monaco-editor'];
export const LINK_COMMAND = `npx link ${LINKED_PACKAGES.map(name => `<library>/node_modules/${name}`).join(' ')} <library>/dist/component-library`;

export const UNLINK = 'npm install';
