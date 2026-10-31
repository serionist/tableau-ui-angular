import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiMenuButtonModule } from 'tableau-ui-angular/menu-button';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-menu-buttons-example',
  imports: [TableauUiButtonModule, TableauUiMenuModule, TableauUiMenuButtonModule],
  templateUrl: './menu-buttons.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonsExampleComponent {
  private readonly snacks = inject(SnackService);

  // An item without items of its own emits clicked, and the menu closes
  protected run(action: string) {
    this.snacks.openSnack(`${action} clicked`, 3000, 'info');
  }
}
