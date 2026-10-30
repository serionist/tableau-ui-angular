import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { FORM_FIELDS_EXAMPLES } from './form-fields.examples';

@Component({
  selector: 'app-form-fields-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './form-fields-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldsPageComponent {
  protected readonly examples = FORM_FIELDS_EXAMPLES;
}
