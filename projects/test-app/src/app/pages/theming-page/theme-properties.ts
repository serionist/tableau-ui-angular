// The theme's CSS custom properties, read from the library's own SCSS, so the theming page lists what the styles define
import colorVars from '../../../../../component-library/styles/colors/_color-vars.scss?source' with { loader: 'text' };
import dark from '../../../../../component-library/styles/colors/_dark.scss?source' with { loader: 'text' };
import light from '../../../../../component-library/styles/colors/_light.scss?source' with { loader: 'text' };
import variables from '../../../../../component-library/styles/_lib-variables.scss?source' with { loader: 'text' };

export interface ThemeProperty {
  readonly name: string;
  readonly light: string;
  readonly dark: string;
  /** Whether it is a colour, which the page shows as a swatch */
  readonly swatch: boolean;
}

// `name: value,` lines in a theme's define-theme map
function themeValues(scss: string): Map<string, string> {
  return new Map([...scss.matchAll(/^\s*([a-z][\w-]*):\s*(.+),\s*$/gm)].map(([, name, value]) => [name, value]));
}

/** The colours: each name in color-vars' list, with its light and dark values */
export function colorProperties(): ThemeProperty[] {
  const list = /\$theme-vars:\s*\(([^)]*)\)/.exec(colorVars)?.[1] ?? '';
  const lightValues = themeValues(light);
  const darkValues = themeValues(dark);
  return list
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
    .map(name => {
      const lightValue = lightValues.get(name) ?? '';
      // a colour, or another theme colour, as the light primary on the base is
      const swatch = lightValue.startsWith('rgb') || lightValue.startsWith('var(--twc-color-');
      return { name: `--twc-${name}`, light: lightValue, dark: darkValues.get(name) ?? '', swatch };
    });
}

/** The fonts, sizes, menus and inputs: each property the variables set on :root, with its first value */
export function otherProperties(): { name: string; value: string }[] {
  const seen = new Map<string, string>();
  for (const [, name, value] of variables.matchAll(/^\s*(--twc-[\w-]+):\s*(.+);\s*$/gm)) {
    if (!seen.has(name)) {
      seen.set(name, value);
    }
  }
  return [...seen].map(([name, value]) => ({ name, value }));
}
