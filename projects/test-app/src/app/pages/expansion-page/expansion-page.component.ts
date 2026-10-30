import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { EXPANSION_PANEL_EXAMPLES } from './expansion-panel.examples';

@Component({
  selector: 'app-expansion-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './expansion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPageComponent {
  protected readonly examples = EXPANSION_PANEL_EXAMPLES;
}
