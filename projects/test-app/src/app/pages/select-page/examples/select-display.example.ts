import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { IOptionLineContext } from 'tableau-ui-angular/common';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { SnackService } from 'tableau-ui-angular/snack';

interface Option {
  value: number;
  text: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select-display-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiIconModule, TableauUiSelectModule],
  templateUrl: './select-display.example.html',
  styleUrl: './select-display.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDisplayExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly options: readonly Option[] = [
    { value: 1, text: 'This is a looooooooooooooooong option, given as values', icon: 'home', hint: 'There are 2 ways to create tab-options: by values and by templates' },
    { value: 2, text: 'Disabled value', hint: 'with a hint', disabled: true },
    { value: 3, text: 'A short option', icon: 'home', hint: 'with a hint' },
  ];

  // The selected value shows its text only, without its icon
  protected readonly onlyText: IOptionLineContext = { renderIcon: false, renderText: true };

  protected readonly $value = signal<number | undefined>(1);

  protected changed(value: number | undefined) {
    this.$value.set(value);
    this.snacks.openSnack(`Single select value changed to: ${value ?? '[none]'}`, 2000, 'info');
  }
}
