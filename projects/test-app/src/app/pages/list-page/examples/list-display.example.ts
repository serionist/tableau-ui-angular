import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiListModule } from 'tableau-ui-angular/list';

interface Option {
  value: number;
  text: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-list-display-example',
  imports: [TableauUiCommonModule, TableauUiFormFieldModule, TableauUiListModule],
  templateUrl: './list-display.example.html',
  styleUrl: './list-display.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDisplayExampleComponent {
  protected readonly options: readonly Option[] = [
    { value: 1, text: 'Option 1', icon: 'home', hint: 'With an icon and a hint' },
    { value: 2, text: 'Option 2, disabled', hint: "It can't be picked", disabled: true },
    { value: 3, text: 'Option 3', icon: 'search', hint: 'With an icon and a hint' },
    { value: 4, text: 'Option 4', icon: 'home', hint: 'With an icon and a hint' },
  ];

  // The lists share one value, so a pick in one shows in each
  protected readonly $value = signal<number | undefined>(3);

  protected readonly onlyText: IOptionGridContext = { renderIcon: false, renderText: true, renderHint: false };
}
