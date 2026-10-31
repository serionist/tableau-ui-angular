import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiDrawerModule } from 'tableau-ui-angular/drawer';

@Component({
  selector: 'app-drawer-basic-example',
  imports: [TableauUiCheckboxModule, TableauUiDrawerModule],
  templateUrl: './drawer-basic.example.html',
  styleUrl: './drawer-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerBasicExampleComponent {
  protected readonly $leftOpen = signal(false);
  protected readonly $rightOpen = signal(true);

  // Enough lines that the content and each drawer scroll on their own
  protected readonly lines = Array.from({ length: 20 }, (_, index) => index + 1);
}
