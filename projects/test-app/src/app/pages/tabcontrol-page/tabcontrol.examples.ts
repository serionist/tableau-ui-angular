import type { DocsExample } from '../../docs/docs-example';
import { TabsBasicExampleComponent } from './examples/tabs-basic.example';
import basicHtml from './examples/tabs-basic.example.html?source' with { loader: 'text' };
import basicTs from './examples/tabs-basic.example.ts?source' with { loader: 'text' };
import { TabsHeaderExampleComponent } from './examples/tabs-header.example';
import headerHtml from './examples/tabs-header.example.html?source' with { loader: 'text' };
import headerScss from './examples/tabs-header.example.scss?source' with { loader: 'text' };
import headerTs from './examples/tabs-header.example.ts?source' with { loader: 'text' };
import { TabsNarrowExampleComponent } from './examples/tabs-narrow.example';
import narrowHtml from './examples/tabs-narrow.example.html?source' with { loader: 'text' };
import narrowScss from './examples/tabs-narrow.example.scss?source' with { loader: 'text' };
import narrowTs from './examples/tabs-narrow.example.ts?source' with { loader: 'text' };

// The tabs page's samples, each with the text of its files
export const TABCONTROL_EXAMPLES = {
  basic: { component: TabsBasicExampleComponent, ts: basicTs, html: basicHtml },
  header: { component: TabsHeaderExampleComponent, ts: headerTs, html: headerHtml, scss: headerScss },
  narrow: { component: TabsNarrowExampleComponent, ts: narrowTs, html: narrowHtml, scss: narrowScss },
} satisfies Record<string, DocsExample>;
