import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { TABLE_EXAMPLES } from './table.examples';

@Component({
  selector: 'app-table-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './table-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePageComponent {
  protected readonly examples = TABLE_EXAMPLES;
}
