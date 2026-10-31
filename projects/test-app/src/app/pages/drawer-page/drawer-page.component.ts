import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { DRAWER_EXAMPLES } from './drawer.examples';

@Component({
  selector: 'app-drawer-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './drawer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerPageComponent {
  protected readonly examples = DRAWER_EXAMPLES;
}
