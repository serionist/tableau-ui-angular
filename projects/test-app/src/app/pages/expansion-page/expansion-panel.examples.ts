import type { DocsExample } from '../../docs/docs-example';
import { ExpansionPanelAccordionExampleComponent } from './examples/expansion-panel-accordion.example';
import accordionHtml from './examples/expansion-panel-accordion.example.html?source' with { loader: 'text' };
import accordionScss from './examples/expansion-panel-accordion.example.scss?source' with { loader: 'text' };
import accordionTs from './examples/expansion-panel-accordion.example.ts?source' with { loader: 'text' };
import { ExpansionPanelSingleExampleComponent } from './examples/expansion-panel-single.example';
import singleHtml from './examples/expansion-panel-single.example.html?source' with { loader: 'text' };
import singleScss from './examples/expansion-panel-single.example.scss?source' with { loader: 'text' };
import singleTs from './examples/expansion-panel-single.example.ts?source' with { loader: 'text' };

// The expansion panel page's samples, each with the text of its files
export const EXPANSION_PANEL_EXAMPLES = {
  single: { component: ExpansionPanelSingleExampleComponent, ts: singleTs, html: singleHtml, scss: singleScss },
  accordion: { component: ExpansionPanelAccordionExampleComponent, ts: accordionTs, html: accordionHtml, scss: accordionScss },
} satisfies Record<string, DocsExample>;
