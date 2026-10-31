import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { TABCONTROL_EXAMPLES } from './tabcontrol.examples';

@Component({
  selector: 'app-tabcontrol-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './tabcontrol-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabcontrolPageComponent {
  protected readonly examples = TABCONTROL_EXAMPLES;
}
