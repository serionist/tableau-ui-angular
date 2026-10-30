import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { CHECKBOX_EXAMPLES } from './checkbox.examples';

@Component({
  selector: 'app-checkbox-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './checkbox-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent {
  protected readonly examples = CHECKBOX_EXAMPLES;
}
