import type { DocsExample } from '../../docs/docs-example';
import { SnackActionExampleComponent } from './examples/snack-action.example';
import actionHtml from './examples/snack-action.example.html?source' with { loader: 'text' };
import actionTs from './examples/snack-action.example.ts?source' with { loader: 'text' };
import { SnackComponentExampleComponent } from './examples/snack-component.example';
import componentHtml from './examples/snack-component.example.html?source' with { loader: 'text' };
import componentScss from './examples/snack-component.example.scss?source' with { loader: 'text' };
import componentTs from './examples/snack-component.example.ts?source' with { loader: 'text' };
import { SnackMessageExampleComponent } from './examples/snack-message.example';
import messageHtml from './examples/snack-message.example.html?source' with { loader: 'text' };
import messageScss from './examples/snack-message.example.scss?source' with { loader: 'text' };
import messageTs from './examples/snack-message.example.ts?source' with { loader: 'text' };
import { SnackTemplateExampleComponent } from './examples/snack-template.example';
import templateHtml from './examples/snack-template.example.html?source' with { loader: 'text' };
import templateScss from './examples/snack-template.example.scss?source' with { loader: 'text' };
import templateTs from './examples/snack-template.example.ts?source' with { loader: 'text' };

// The snackbar page's samples, each with the text of its files
export const SNACKS_EXAMPLES = {
  message: { component: SnackMessageExampleComponent, ts: messageTs, html: messageHtml, scss: messageScss },
  action: { component: SnackActionExampleComponent, ts: actionTs, html: actionHtml },
  template: { component: SnackTemplateExampleComponent, ts: templateTs, html: templateHtml, scss: templateScss },
  component: { component: SnackComponentExampleComponent, ts: componentTs, html: componentHtml, scss: componentScss },
} satisfies Record<string, DocsExample>;
