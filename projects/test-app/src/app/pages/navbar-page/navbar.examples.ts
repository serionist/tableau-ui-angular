import type { DocsExample } from '../../docs/docs-example';
import { NavBarBasicExampleComponent } from './examples/nav-bar-basic.example';
import basicHtml from './examples/nav-bar-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/nav-bar-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/nav-bar-basic.example.ts?source' with { loader: 'text' };

// The nav bar page's samples, each with the text of its files
export const NAVBAR_EXAMPLES = {
  basic: { component: NavBarBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
} satisfies Record<string, DocsExample>;
