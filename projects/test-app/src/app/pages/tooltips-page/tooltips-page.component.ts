import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { TOOLTIPS_EXAMPLES } from './tooltips.examples';

@Component({
  selector: 'app-tooltips-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './tooltips-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsPageComponent {
  protected readonly examples = TOOLTIPS_EXAMPLES;
}
