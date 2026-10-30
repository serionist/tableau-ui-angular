import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import type { IOptionLineContext } from 'tableau-ui-angular/common';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';

interface Option {
  value: number;
  text: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select-forms-example',
  imports: [TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiIconModule, TableauUiSelectModule],
  templateUrl: './select-forms.example.html',
  styleUrl: './select-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFormsExampleComponent {
  private readonly fb = inject(FB);

  protected readonly options: readonly Option[] = [
    { value: 1, text: 'This is a looooooooooooooooong option, given as values', icon: 'home', hint: 'There are 2 ways to create tab-options: by values and by templates' },
    { value: 2, text: 'Disabled value', hint: 'with a hint', disabled: true },
    { value: 3, text: 'Option 3', icon: 'home', hint: 'with a hint' },
    { value: 4, text: 'Option 4, above the maximum', icon: 'home', hint: 'The validators allow 1 to 3' },
  ];

  protected readonly onlyText: IOptionLineContext = { renderIcon: false, renderText: true };

  // Each starts at 4, above Validators.max(3): its error shows once the user leaves the select, as formHasError waits
  // for the control to be touched
  private readonly validators = [Validators.required, Validators.min(1), Validators.max(3)];
  protected readonly wrap = this.fb.control<number | null>(4, this.validators);
  protected readonly truncate = this.fb.control<number | null>(4, this.validators);
  protected readonly noChevron = this.fb.control<number | null>(4, this.validators);
  // the fourth argument starts the control disabled
  protected readonly disabled = this.fb.control<number | null>(2, undefined, undefined, true);
}
