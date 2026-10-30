import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiMenuButtonModule } from 'tableau-ui-angular/menu-button';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-menu-width-example',
  imports: [TableauUiButtonModule, TableauUiMenuModule, TableauUiMenuButtonModule],
  templateUrl: './menu-width.example.html',
  styleUrl: './menu-width.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuWidthExampleComponent {
  private readonly snacks = inject(SnackService);

  protected sort(by: string) {
    this.snacks.openSnack(`Sorted by ${by}`, 3000, 'info');
  }
}
