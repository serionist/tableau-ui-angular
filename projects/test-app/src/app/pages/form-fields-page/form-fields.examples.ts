import type { DocsExample } from '../../docs/docs-example';
import { FormFieldAutocompleteExampleComponent } from './examples/form-field-autocomplete.example';
import autocompleteHtml from './examples/form-field-autocomplete.example.html?source' with { loader: 'text' };
import autocompleteScss from './examples/form-field-autocomplete.example.scss?source' with { loader: 'text' };
import autocompleteTs from './examples/form-field-autocomplete.example.ts?source' with { loader: 'text' };
import { FormFieldFormsExampleComponent } from './examples/form-field-forms.example';
import formsHtml from './examples/form-field-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/form-field-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/form-field-forms.example.ts?source' with { loader: 'text' };
import { FormFieldValidationExampleComponent } from './examples/form-field-validation.example';
import validationHtml from './examples/form-field-validation.example.html?source' with { loader: 'text' };
import validationScss from './examples/form-field-validation.example.scss?source' with { loader: 'text' };
import validationTs from './examples/form-field-validation.example.ts?source' with { loader: 'text' };
import { FormFieldValueExampleComponent } from './examples/form-field-value.example';
import valueHtml from './examples/form-field-value.example.html?source' with { loader: 'text' };
import valueScss from './examples/form-field-value.example.scss?source' with { loader: 'text' };
import valueTs from './examples/form-field-value.example.ts?source' with { loader: 'text' };

// The form fields page's samples, each with the text of its files
export const FORM_FIELDS_EXAMPLES = {
  value: { component: FormFieldValueExampleComponent, ts: valueTs, html: valueHtml, scss: valueScss },
  autocomplete: { component: FormFieldAutocompleteExampleComponent, ts: autocompleteTs, html: autocompleteHtml, scss: autocompleteScss },
  forms: { component: FormFieldFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
  validation: { component: FormFieldValidationExampleComponent, ts: validationTs, html: validationHtml, scss: validationScss },
} satisfies Record<string, DocsExample>;
