import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiListModule } from 'tableau-ui-angular/list';

@Component({
  selector: 'app-list-height-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiListModule],
  templateUrl: './list-height.example.html',
  styleUrl: './list-height.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHeightExampleComponent {
  protected readonly options = Array.from({ length: 8 }, (_, index) => ({ value: index + 1, text: `Option ${index + 1}` }));

  protected readonly $value = signal<number | undefined>(undefined);
}
