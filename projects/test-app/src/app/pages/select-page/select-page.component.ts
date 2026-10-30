import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { SELECT_EXAMPLES } from './select.examples';

@Component({
  selector: 'app-select-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './select-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPageComponent {
  protected readonly examples = SELECT_EXAMPLES;
}
