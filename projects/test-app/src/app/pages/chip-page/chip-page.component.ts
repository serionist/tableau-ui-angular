import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { CHIP_EXAMPLES } from './chip.examples';

@Component({
  selector: 'app-chip-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './chip-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipPageComponent {
  protected readonly examples = CHIP_EXAMPLES;
}
