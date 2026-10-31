import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiListModule } from 'tableau-ui-angular/list';

@Component({
  selector: 'app-list-options-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiListModule],
  templateUrl: './list-options.example.html',
  styleUrl: './list-options.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListOptionsExampleComponent {
  protected readonly $value = signal<number | undefined>(undefined);
}
