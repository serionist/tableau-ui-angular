// The angular.json entry the Monaco page shows, which serves Monaco's files where the editor loads them from,
// monaco-edit/vs under the page's base href. docs-pages.spec.ts checks this site's angular.json has the same entry
export const MONACO_ASSET = '{ "glob": "**/*", "input": "node_modules/monaco-editor/min", "output": "/monaco-edit" }';
