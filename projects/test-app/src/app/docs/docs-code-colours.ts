/** A run of a code block's text, and the kind of token it is, a key of `CODE_COLOURS`, when it has a colour */
export interface CodeToken {
  readonly text: string;
  readonly scope: string | undefined;
}

/**
 * The colour of each kind of token Monaco's tokenizers name, in the site's light and dark mode: Monaco's own, from its
 * vs and vs-dark themes, except five that read below 4.5:1 on the code's background. In light, numbers (#098658) and
 * attribute names (#ff0000) are darker; in dark, comments (#608b4e), regular expressions (#b46695) and HTML's angle
 * brackets (#808080) are lighter, mostly to VS Code's own colours for them. A token takes the colour of the longest
 * key its type starts with, as in Monaco's themes: `keyword.json` for JSON's `true`, `keyword` for TypeScript's
 * `const`. A type no key starts, such as an identifier or the `@` of a decorator, which Monaco's TypeScript marks
 * invalid, keeps the text's colour.
 */
export const CODE_COLOURS: Readonly<Record<string, { readonly light: string; readonly dark: string }>> = {
  comment: { light: '#008000', dark: '#6a9955' },
  keyword: { light: '#0000ff', dark: '#569cd6' },
  'keyword.json': { light: '#0451a5', dark: '#ce9178' },
  string: { light: '#a31515', dark: '#ce9178' },
  'string.key.json': { light: '#a31515', dark: '#9cdcfe' },
  'string.value.json': { light: '#0451a5', dark: '#ce9178' },
  number: { light: '#098155', dark: '#b5cea8' },
  regexp: { light: '#800000', dark: '#d16969' },
  type: { light: '#008080', dark: '#3dc9b0' },
  variable: { light: '#001188', dark: '#74b0df' },
  tag: { light: '#800000', dark: '#569cd6' },
  'delimiter.html': { light: '#383838', dark: '#8a8a8a' },
  'attribute.name': { light: '#e50000', dark: '#9cdcfe' },
  'attribute.value': { light: '#0451a5', dark: '#ce9178' },
  'attribute.value.html': { light: '#0000ff', dark: '#ce9178' },
  'meta.scss': { light: '#800000', dark: '#a79873' },
  'operator.scss': { light: '#666666', dark: '#909090' },
};

const LANGUAGES: Readonly<Record<string, string>> = { ts: 'typescript', html: 'html', scss: 'scss', json: 'json', command: 'shell' };

/** Monaco's language for a block, from its label: `command`, a file's extension, or a sample's tab, such as `TS` */
export function codeLanguage(label: string): string | undefined {
  const kind = (/\.(\w+)$/.exec(label)?.[1] ?? label).toLowerCase();
  return Object.hasOwn(LANGUAGES, kind) ? LANGUAGES[kind] : undefined;
}

// The key of CODE_COLOURS for a token's type, such as `attribute.value.html` for `attribute.value.html`, `string` for
// `string.ts`, and none for `identifier.ts`
function scopeOf(type: string): string | undefined {
  const parts = type.split('.');
  for (let length = parts.length; length > 0; length--) {
    const scope = parts.slice(0, length).join('.');
    if (Object.hasOwn(CODE_COLOURS, scope)) {
      return scope;
    }
  }
  return undefined;
}

/**
 * The text as runs of one kind of token each, from Monaco's tokens for each of its lines: every character of the text,
 * its line breaks too, in order, so the runs hold the text as it is. Undefined when the tokens don't fit the text.
 */
export function codeTokens(lines: readonly (readonly { readonly offset: number; readonly type: string }[])[], text: string): CodeToken[] | undefined {
  const runs: CodeToken[] = [];
  const add = (part: string, scope: string | undefined) => {
    const last = runs.at(-1);
    if (part === '') {
      return;
    }
    if (last && last.scope === scope) {
      runs[runs.length - 1] = { text: last.text + part, scope };
    } else {
      runs.push({ text: part, scope });
    }
  };
  // Monaco splits the text into lines at each of these breaks; the capture keeps each break between its lines
  const parts = text.split(/(\r\n|\r|\n)/);
  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index];
    const tokens = lines[index / 2] ?? [];
    add(line.slice(0, tokens.at(0)?.offset ?? line.length), undefined);
    tokens.forEach((token, i) => {
      add(line.slice(token.offset, tokens.at(i + 1)?.offset ?? line.length), scopeOf(token.type));
    });
    add(parts.at(index + 1) ?? '', undefined);
  }
  return runs.map(run => run.text).join('') === text ? runs : undefined;
}
