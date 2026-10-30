import type { DocsExample } from '../../docs/docs-example';
import { DrawerBasicExampleComponent } from './examples/drawer-basic.example';
import basicHtml from './examples/drawer-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/drawer-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/drawer-basic.example.ts?source' with { loader: 'text' };

// The drawer page's samples, each with the text of its files
export const DRAWER_EXAMPLES = {
  basic: { component: DrawerBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
} satisfies Record<string, DocsExample>;
