import type { DocsExample } from '../../docs/docs-example';
import { CheckboxFormsExampleComponent } from './examples/checkbox-forms.example';
import formsHtml from './examples/checkbox-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/checkbox-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/checkbox-forms.example.ts?source' with { loader: 'text' };
import { CheckboxPartialExampleComponent } from './examples/checkbox-partial.example';
import partialHtml from './examples/checkbox-partial.example.html?source' with { loader: 'text' };
import partialScss from './examples/checkbox-partial.example.scss?source' with { loader: 'text' };
import partialTs from './examples/checkbox-partial.example.ts?source' with { loader: 'text' };
import { CheckboxValueExampleComponent } from './examples/checkbox-value.example';
import valueHtml from './examples/checkbox-value.example.html?source' with { loader: 'text' };
import valueScss from './examples/checkbox-value.example.scss?source' with { loader: 'text' };
import valueTs from './examples/checkbox-value.example.ts?source' with { loader: 'text' };

// The checkbox page's samples, each with the text of its files
export const CHECKBOX_EXAMPLES = {
  value: { component: CheckboxValueExampleComponent, ts: valueTs, html: valueHtml, scss: valueScss },
  partial: { component: CheckboxPartialExampleComponent, ts: partialTs, html: partialHtml, scss: partialScss },
  forms: { component: CheckboxFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
} satisfies Record<string, DocsExample>;
