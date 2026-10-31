import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { SNACKS_EXAMPLES } from './snacks.examples';

@Component({
  selector: 'app-snacks-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './snacks-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnacksPageComponent {
  protected readonly examples = SNACKS_EXAMPLES;
}
