import type { DocsExample } from '../../docs/docs-example';
import { VirtualizeDataExampleComponent } from './examples/virtualize-data.example';
import dataHtml from './examples/virtualize-data.example.html?source' with { loader: 'text' };
import dataScss from './examples/virtualize-data.example.scss?source' with { loader: 'text' };
import dataTs from './examples/virtualize-data.example.ts?source' with { loader: 'text' };
import { VirtualizeHeightExampleComponent } from './examples/virtualize-height.example';
import heightHtml from './examples/virtualize-height.example.html?source' with { loader: 'text' };
import heightScss from './examples/virtualize-height.example.scss?source' with { loader: 'text' };
import heightTs from './examples/virtualize-height.example.ts?source' with { loader: 'text' };

// The virtualization page's samples, each with the text of its files
export const VIRTUALIZE_EXAMPLES = {
  data: { component: VirtualizeDataExampleComponent, ts: dataTs, html: dataHtml, scss: dataScss },
  height: { component: VirtualizeHeightExampleComponent, ts: heightTs, html: heightHtml, scss: heightScss },
} satisfies Record<string, DocsExample>;
