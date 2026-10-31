// The angular.json entry the Monaco page shows, which serves Monaco's files where the editor loads them from,
// monaco-edit/vs under the page's base href. docs-pages.spec.ts checks the editor's path and this site's angular.json
export const MONACO_ASSET = '{ "glob": "**/*", "input": "node_modules/monaco-editor/min", "output": "/monaco-edit" }';

// The entry after a new app's own, its public folder, so a paste keeps the app's assets
export const MONACO_ASSETS = `"assets": [\n  { "glob": "**/*", "input": "public" },\n  ${MONACO_ASSET}\n]`;
