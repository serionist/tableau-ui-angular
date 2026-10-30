import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-select-options-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiSelectModule],
  templateUrl: './select-options.example.html',
  styleUrl: './select-options.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionsExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $value = signal<number | undefined>(undefined);

  protected changed(value: number | undefined) {
    this.$value.set(value);
    this.snacks.openSnack(`Single select value changed to: ${value ?? '[none]'}`, 2000, 'info');
  }
}
