import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';

@Component({
  selector: 'app-menu-simple-example',
  imports: [TableauUiButtonModule, TableauUiMenuModule],
  templateUrl: './menu-simple.example.html',
  styleUrl: './menu-simple.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSimpleExampleComponent {}
