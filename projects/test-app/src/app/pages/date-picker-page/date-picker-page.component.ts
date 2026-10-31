import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { DATE_PICKER_EXAMPLES } from './date-picker.examples';

@Component({
  selector: 'app-date-picker-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './date-picker-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPageComponent {
  protected readonly examples = DATE_PICKER_EXAMPLES;
}
