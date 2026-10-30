import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { NAVBAR_EXAMPLES } from './navbar.examples';

@Component({
  selector: 'app-navbar-page',
  imports: [TableauUiCommonModule, DocsExampleComponent],
  templateUrl: './navbar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPageComponent {
  protected readonly examples = NAVBAR_EXAMPLES;
}
