import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { SCROLLER_EXAMPLES } from './scroller.examples';

@Component({
  selector: 'app-scroller-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './scroller-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerPageComponent {
  protected readonly examples = SCROLLER_EXAMPLES;
}
