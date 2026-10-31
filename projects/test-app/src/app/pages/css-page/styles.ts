import fontsScss from '../../../../../component-library/styles/_fonts.scss?source' with { loader: 'text' };

// The lines the CSS & Fonts page tells an app to put in its styles.scss. docs-pages.spec.ts finds each in the docs
// site's own styles.scss
export const STYLES_USE = "@use 'tableau-ui-angular/styles/lib-styles' as libStyles;";
export const FONT_IMPORT = "@include libStyles.font-import('/fonts');";
export const ROBOTO_IMPORT = "@import 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap';";

export interface FontFace {
  readonly family: string;
  readonly weight: string;
  readonly style: string;
  /** The file's name, without its extension: font-import loads its .woff2, then its .woff */
  readonly file: string;
}

/** Each font face font-import declares, read from the library's own SCSS */
export function fontFaces(): FontFace[] {
  return fontsScss
    .split('@font-face')
    .slice(1)
    .map(face => ({
      family: /font-family:\s*'([^']+)'/.exec(face)?.[1] ?? '',
      weight: /font-weight:\s*(\w+)/.exec(face)?.[1] ?? '',
      style: /font-style:\s*(\w+)/.exec(face)?.[1] ?? '',
      file: /\/([\w-]+)\.woff2\)/.exec(face)?.[1] ?? '',
    }));
}
