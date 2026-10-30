import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { DIALOGS_EXAMPLES } from './dialogs.examples';

@Component({
  selector: 'app-dialogs-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './dialogs-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogsPageComponent {
  protected readonly examples = DIALOGS_EXAMPLES;
}
