import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';

@Component({
  selector: 'app-theme-override-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule],
  templateUrl: './theme-override.example.html',
  styleUrl: './theme-override.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeOverrideExampleComponent {}
