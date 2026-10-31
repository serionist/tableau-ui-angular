import type { DocsExample } from '../../docs/docs-example';
import { TooltipTemplateExampleComponent } from './examples/tooltip-template.example';
import templateHtml from './examples/tooltip-template.example.html?source' with { loader: 'text' };
import templateScss from './examples/tooltip-template.example.scss?source' with { loader: 'text' };
import templateTs from './examples/tooltip-template.example.ts?source' with { loader: 'text' };
import { TooltipTextExampleComponent } from './examples/tooltip-text.example';
import textHtml from './examples/tooltip-text.example.html?source' with { loader: 'text' };
import textScss from './examples/tooltip-text.example.scss?source' with { loader: 'text' };
import textTs from './examples/tooltip-text.example.ts?source' with { loader: 'text' };

// The tooltips page's samples, each with the text of its files
export const TOOLTIPS_EXAMPLES = {
  text: { component: TooltipTextExampleComponent, ts: textTs, html: textHtml, scss: textScss },
  template: { component: TooltipTemplateExampleComponent, ts: templateTs, html: templateHtml, scss: templateScss },
} satisfies Record<string, DocsExample>;
