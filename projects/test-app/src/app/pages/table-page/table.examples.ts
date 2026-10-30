import type { DocsExample } from '../../docs/docs-example';
import { TableBasicExampleComponent } from './examples/table-basic.example';
import basicHtml from './examples/table-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/table-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/table-basic.example.ts?source' with { loader: 'text' };
import { TableOptionsExampleComponent } from './examples/table-options.example';
import optionsHtml from './examples/table-options.example.html?source' with { loader: 'text' };
import optionsScss from './examples/table-options.example.scss?source' with { loader: 'text' };
import optionsTs from './examples/table-options.example.ts?source' with { loader: 'text' };

// The table page's samples, each with the text of its files
export const TABLE_EXAMPLES = {
  basic: { component: TableBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
  options: { component: TableOptionsExampleComponent, ts: optionsTs, html: optionsHtml, scss: optionsScss },
} satisfies Record<string, DocsExample>;
