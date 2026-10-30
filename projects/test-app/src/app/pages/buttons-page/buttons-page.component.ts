import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { BUTTONS_EXAMPLES } from './buttons.examples';

@Component({
  selector: 'app-buttons-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './buttons-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsPageComponent {
  protected readonly examples = BUTTONS_EXAMPLES;
}
