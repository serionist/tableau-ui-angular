import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiListModule } from 'tableau-ui-angular/list';

interface Option {
  value: number;
  text: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-list-forms-example',
  imports: [TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiIconModule, TableauUiListModule],
  templateUrl: './list-forms.example.html',
  styleUrl: './list-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFormsExampleComponent {
  private readonly fb = inject(FB);

  protected readonly options: readonly Option[] = [
    { value: 1, text: 'Option 1', icon: 'home', hint: 'With an icon and a hint' },
    { value: 2, text: 'Option 2, disabled', hint: "It can't be picked", disabled: true },
    { value: 3, text: 'Option 3', icon: 'search', hint: 'With an icon and a hint' },
    { value: 4, text: 'Option 4, above the maximum', icon: 'home', hint: 'The validators allow 1 to 3' },
  ];

  // Each starts at 4, above Validators.max(3): its error shows once the user leaves the list, as formHasError waits for
  // the control to be touched
  private readonly validators = [Validators.required, Validators.min(1), Validators.max(3)];
  protected readonly single = this.fb.control<number | null>(4, this.validators);
  protected readonly prefixed = this.fb.control<number | null>(4, this.validators);
  // the fourth argument starts the control disabled
  protected readonly disabled = this.fb.control<number | null>(2, undefined, undefined, true);

  // A multi-select list's value is an array; a click adds an option, or takes it out
  protected readonly multi = this.fb.control<number[] | null>([1, 3], [Validators.required]);
  protected readonly $multiValue = computed(() => {
    const values = this.multi.$value() ?? [];
    return values.length > 0 ? values.join(', ') : 'none';
  });
}
