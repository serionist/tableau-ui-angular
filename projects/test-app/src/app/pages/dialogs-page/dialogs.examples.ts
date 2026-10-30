import type { DocsExample } from '../../docs/docs-example';
import { DialogConfirmExampleComponent } from './examples/dialog-confirm.example';
import confirmHtml from './examples/dialog-confirm.example.html?source' with { loader: 'text' };
import confirmScss from './examples/dialog-confirm.example.scss?source' with { loader: 'text' };
import confirmTs from './examples/dialog-confirm.example.ts?source' with { loader: 'text' };
import { DialogCustomExampleComponent } from './examples/dialog-custom.example';
import customHtml from './examples/dialog-custom.example.html?source' with { loader: 'text' };
import customTs from './examples/dialog-custom.example.ts?source' with { loader: 'text' };
import { DialogTemplateExampleComponent } from './examples/dialog-template.example';
import templateHtml from './examples/dialog-template.example.html?source' with { loader: 'text' };
import templateScss from './examples/dialog-template.example.scss?source' with { loader: 'text' };
import templateTs from './examples/dialog-template.example.ts?source' with { loader: 'text' };

// The dialogs page's samples, each with the text of its files
export const DIALOGS_EXAMPLES = {
  confirm: { component: DialogConfirmExampleComponent, ts: confirmTs, html: confirmHtml, scss: confirmScss },
  template: { component: DialogTemplateExampleComponent, ts: templateTs, html: templateHtml, scss: templateScss },
  custom: { component: DialogCustomExampleComponent, ts: customTs, html: customHtml },
} satisfies Record<string, DocsExample>;
