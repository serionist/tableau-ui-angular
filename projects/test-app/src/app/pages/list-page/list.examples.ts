import type { DocsExample } from '../../docs/docs-example';
import { ListDisplayExampleComponent } from './examples/list-display.example';
import displayHtml from './examples/list-display.example.html?source' with { loader: 'text' };
import displayScss from './examples/list-display.example.scss?source' with { loader: 'text' };
import displayTs from './examples/list-display.example.ts?source' with { loader: 'text' };
import { ListFormsExampleComponent } from './examples/list-forms.example';
import formsHtml from './examples/list-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/list-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/list-forms.example.ts?source' with { loader: 'text' };
import { ListHeightExampleComponent } from './examples/list-height.example';
import heightHtml from './examples/list-height.example.html?source' with { loader: 'text' };
import heightScss from './examples/list-height.example.scss?source' with { loader: 'text' };
import heightTs from './examples/list-height.example.ts?source' with { loader: 'text' };
import { ListOptionsExampleComponent } from './examples/list-options.example';
import optionsHtml from './examples/list-options.example.html?source' with { loader: 'text' };
import optionsScss from './examples/list-options.example.scss?source' with { loader: 'text' };
import optionsTs from './examples/list-options.example.ts?source' with { loader: 'text' };

// The list page's samples, each with the text of its files
export const LIST_EXAMPLES = {
  options: { component: ListOptionsExampleComponent, ts: optionsTs, html: optionsHtml, scss: optionsScss },
  display: { component: ListDisplayExampleComponent, ts: displayTs, html: displayHtml, scss: displayScss },
  height: { component: ListHeightExampleComponent, ts: heightTs, html: heightHtml, scss: heightScss },
  forms: { component: ListFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
} satisfies Record<string, DocsExample>;
