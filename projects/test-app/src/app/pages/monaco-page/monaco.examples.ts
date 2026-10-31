import type { DocsExample } from '../../docs/docs-example';
import { MonacoFormsExampleComponent } from './examples/monaco-forms.example';
import formsHtml from './examples/monaco-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/monaco-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/monaco-forms.example.ts?source' with { loader: 'text' };
import { MonacoValueExampleComponent } from './examples/monaco-value.example';
import valueHtml from './examples/monaco-value.example.html?source' with { loader: 'text' };
import valueScss from './examples/monaco-value.example.scss?source' with { loader: 'text' };
import valueTs from './examples/monaco-value.example.ts?source' with { loader: 'text' };

// The Monaco page's samples, each with the text of its files
export const MONACO_EXAMPLES = {
  value: { component: MonacoValueExampleComponent, ts: valueTs, html: valueHtml, scss: valueScss },
  forms: { component: MonacoFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
} satisfies Record<string, DocsExample>;
