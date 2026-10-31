import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { VIRTUALIZE_EXAMPLES } from './virtualize.examples';

@Component({
  selector: 'app-virtualize-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './virtualize-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualizePageComponent {
  protected readonly examples = VIRTUALIZE_EXAMPLES;
}
