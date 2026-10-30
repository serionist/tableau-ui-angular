import type { DocsExample } from '../../docs/docs-example';
import { SelectDisplayExampleComponent } from './examples/select-display.example';
import displayHtml from './examples/select-display.example.html?source' with { loader: 'text' };
import displayScss from './examples/select-display.example.scss?source' with { loader: 'text' };
import displayTs from './examples/select-display.example.ts?source' with { loader: 'text' };
import { SelectFormsExampleComponent } from './examples/select-forms.example';
import formsHtml from './examples/select-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/select-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/select-forms.example.ts?source' with { loader: 'text' };
import { SelectMultiExampleComponent } from './examples/select-multi.example';
import multiHtml from './examples/select-multi.example.html?source' with { loader: 'text' };
import multiScss from './examples/select-multi.example.scss?source' with { loader: 'text' };
import multiTs from './examples/select-multi.example.ts?source' with { loader: 'text' };
import { SelectOptionsExampleComponent } from './examples/select-options.example';
import optionsHtml from './examples/select-options.example.html?source' with { loader: 'text' };
import optionsScss from './examples/select-options.example.scss?source' with { loader: 'text' };
import optionsTs from './examples/select-options.example.ts?source' with { loader: 'text' };
import { SelectSearchExampleComponent } from './examples/select-search.example';
import searchHtml from './examples/select-search.example.html?source' with { loader: 'text' };
import searchScss from './examples/select-search.example.scss?source' with { loader: 'text' };
import searchTs from './examples/select-search.example.ts?source' with { loader: 'text' };

// The select page's samples, each with the text of its files
export const SELECT_EXAMPLES = {
  options: { component: SelectOptionsExampleComponent, ts: optionsTs, html: optionsHtml, scss: optionsScss },
  display: { component: SelectDisplayExampleComponent, ts: displayTs, html: displayHtml, scss: displayScss },
  forms: { component: SelectFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
  multi: { component: SelectMultiExampleComponent, ts: multiTs, html: multiHtml, scss: multiScss },
  search: { component: SelectSearchExampleComponent, ts: searchTs, html: searchHtml, scss: searchScss },
} satisfies Record<string, DocsExample>;
