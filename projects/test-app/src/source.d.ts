// A file's text, for the docs site's samples. The build reads it as text when the import ends in `?source` and says
// `with { loader: 'text' }`, as the docs pages' `*.examples.ts` do:
//   import firstButtonTs from './examples/first-button.example.ts?source' with { loader: 'text' };
// The suffix keeps TypeScript from resolving the file itself, so a sample's `.ts` reads as a string too.
declare module '*?source' {
  const source: string;
  export default source;
}

// A file's bytes, for a spec that reads a binary file such as a PNG: the import ends in `?bytes` and says
// `with { loader: 'binary' }`.
declare module '*?bytes' {
  const bytes: Uint8Array;
  export default bytes;
}
