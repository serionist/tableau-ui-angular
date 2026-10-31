import type { DocsExample } from '../../docs/docs-example';
import { IconBasicExampleComponent } from './examples/icon-basic.example';
import basicHtml from './examples/icon-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/icon-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/icon-basic.example.ts?source' with { loader: 'text' };
import { IconStyleExampleComponent } from './examples/icon-style.example';
import styleHtml from './examples/icon-style.example.html?source' with { loader: 'text' };
import styleScss from './examples/icon-style.example.scss?source' with { loader: 'text' };
import styleTs from './examples/icon-style.example.ts?source' with { loader: 'text' };

// The icons page's samples, each with the text of its files
export const ICONS_EXAMPLES = {
  basic: { component: IconBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
  style: { component: IconStyleExampleComponent, ts: styleTs, html: styleHtml, scss: styleScss },
} satisfies Record<string, DocsExample>;
