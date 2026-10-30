import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';

@Component({
  selector: 'app-button-links-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule],
  templateUrl: './button-links.example.html',
  styleUrl: './button-links.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLinksExampleComponent {
  protected readonly repo = 'https://github.com/serionist/tableau-ui-angular';
  protected readonly $loading = signal(false);
}
