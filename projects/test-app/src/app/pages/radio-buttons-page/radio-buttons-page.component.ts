import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { RADIO_BUTTONS_EXAMPLES } from './radio-buttons.examples';

@Component({
  selector: 'app-radio-buttons-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './radio-buttons-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonsPageComponent {
  protected readonly examples = RADIO_BUTTONS_EXAMPLES;
}
