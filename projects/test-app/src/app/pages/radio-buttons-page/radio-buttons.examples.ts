import type { DocsExample } from '../../docs/docs-example';
import { RadioDisabledExampleComponent } from './examples/radio-disabled.example';
import disabledHtml from './examples/radio-disabled.example.html?source' with { loader: 'text' };
import disabledTs from './examples/radio-disabled.example.ts?source' with { loader: 'text' };
import { RadioFormsExampleComponent } from './examples/radio-forms.example';
import formsHtml from './examples/radio-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/radio-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/radio-forms.example.ts?source' with { loader: 'text' };
import { RadioValueExampleComponent } from './examples/radio-value.example';
import valueHtml from './examples/radio-value.example.html?source' with { loader: 'text' };
import valueScss from './examples/radio-value.example.scss?source' with { loader: 'text' };
import valueTs from './examples/radio-value.example.ts?source' with { loader: 'text' };

// The radio groups page's samples, each with the text of its files
export const RADIO_BUTTONS_EXAMPLES = {
  value: { component: RadioValueExampleComponent, ts: valueTs, html: valueHtml, scss: valueScss },
  forms: { component: RadioFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
  disabled: { component: RadioDisabledExampleComponent, ts: disabledTs, html: disabledHtml },
} satisfies Record<string, DocsExample>;
