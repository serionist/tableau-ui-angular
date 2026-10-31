import type { DocsExample } from '../../docs/docs-example';
import { ScrollerHorizontalExampleComponent } from './examples/scroller-horizontal.example';
import horizontalHtml from './examples/scroller-horizontal.example.html?source' with { loader: 'text' };
import horizontalScss from './examples/scroller-horizontal.example.scss?source' with { loader: 'text' };
import horizontalTs from './examples/scroller-horizontal.example.ts?source' with { loader: 'text' };
import { ScrollerVerticalExampleComponent } from './examples/scroller-vertical.example';
import verticalHtml from './examples/scroller-vertical.example.html?source' with { loader: 'text' };
import verticalScss from './examples/scroller-vertical.example.scss?source' with { loader: 'text' };
import verticalTs from './examples/scroller-vertical.example.ts?source' with { loader: 'text' };

// The arrow scroller page's samples, each with the text of its files
export const SCROLLER_EXAMPLES = {
  vertical: { component: ScrollerVerticalExampleComponent, ts: verticalTs, html: verticalHtml, scss: verticalScss },
  horizontal: { component: ScrollerHorizontalExampleComponent, ts: horizontalTs, html: horizontalHtml, scss: horizontalScss },
} satisfies Record<string, DocsExample>;
