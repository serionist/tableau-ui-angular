import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { CLIPBOARD_EXAMPLES } from './clipboard.examples';

@Component({
  selector: 'app-clipboard-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './clipboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardPageComponent {
  protected readonly examples = CLIPBOARD_EXAMPLES;
}
