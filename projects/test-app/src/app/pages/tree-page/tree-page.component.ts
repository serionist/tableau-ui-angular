import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { TREE_EXAMPLES } from './tree.examples';

@Component({
  selector: 'app-tree-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './tree-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePageComponent {
  protected readonly examples = TREE_EXAMPLES;
}
