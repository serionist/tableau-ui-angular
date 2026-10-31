import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { LIST_EXAMPLES } from './list.examples';

@Component({
  selector: 'app-list-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPageComponent {
  protected readonly examples = LIST_EXAMPLES;
}
