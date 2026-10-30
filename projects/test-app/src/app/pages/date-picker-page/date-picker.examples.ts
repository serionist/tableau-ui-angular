import type { DocsExample } from '../../docs/docs-example';
import { DatePickerFormsExampleComponent } from './examples/date-picker-forms.example';
import formsHtml from './examples/date-picker-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/date-picker-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/date-picker-forms.example.ts?source' with { loader: 'text' };
import { DatePickerValueExampleComponent } from './examples/date-picker-value.example';
import valueHtml from './examples/date-picker-value.example.html?source' with { loader: 'text' };
import valueScss from './examples/date-picker-value.example.scss?source' with { loader: 'text' };
import valueTs from './examples/date-picker-value.example.ts?source' with { loader: 'text' };

// The date picker page's samples, each with the text of its files
export const DATE_PICKER_EXAMPLES = {
  value: { component: DatePickerValueExampleComponent, ts: valueTs, html: valueHtml, scss: valueScss },
  forms: { component: DatePickerFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
} satisfies Record<string, DocsExample>;
