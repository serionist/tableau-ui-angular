import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { MENU_EXAMPLES } from './menu.examples';

@Component({
  selector: 'app-menu-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './menu-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {
  protected readonly examples = MENU_EXAMPLES;
}
