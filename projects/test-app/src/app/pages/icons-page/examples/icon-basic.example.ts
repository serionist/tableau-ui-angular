import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@Component({
  selector: 'app-icon-basic-example',
  imports: [TableauUiButtonModule, TableauUiIconModule],
  templateUrl: './icon-basic.example.html',
  styleUrl: './icon-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBasicExampleComponent {
  protected readonly $searches = signal(0);
}
