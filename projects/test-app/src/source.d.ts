// A file's text, for the docs site's samples. The build reads it as text when the import ends in `?source` and says
// `with { loader: 'text' }`, as the docs pages' `*.examples.ts` do:
//   import firstButtonTs from './examples/first-button.example.ts?source' with { loader: 'text' };
// The suffix keeps TypeScript from resolving the file itself, so a sample's `.ts` reads as a string too.
declare module '*?source' {
  const source: string;
  export default source;
}
