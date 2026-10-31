import type { DocsExample } from '../../docs/docs-example';
import { CssTextExampleComponent } from './examples/css-text.example';
import textHtml from './examples/css-text.example.html?source' with { loader: 'text' };
import textScss from './examples/css-text.example.scss?source' with { loader: 'text' };
import textTs from './examples/css-text.example.ts?source' with { loader: 'text' };

// The CSS & Fonts page's samples, each with the text of its files
export const CSS_EXAMPLES = {
  text: { component: CssTextExampleComponent, ts: textTs, html: textHtml, scss: textScss },
} satisfies Record<string, DocsExample>;
