import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, skip } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import type { FC } from 'tableau-ui-angular/form';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

interface Fields {
  simple: string;
  placeholder: string;
  decorated: string;
  disabled: string;
  password: string;
  textarea: string;
}

@Component({
  selector: 'app-form-field-forms-example',
  imports: [TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiIconModule],
  templateUrl: './form-field-forms.example.html',
  styleUrl: './form-field-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldFormsExampleComponent {
  private readonly fb = inject(FB);
  private readonly snacks = inject(SnackService);

  protected readonly form = this.fb.group<Fields>({
    simple: this.fb.control<string>(''),
    placeholder: this.fb.control<string>(''),
    decorated: this.fb.control<string>(''),
    // the fourth argument starts the control disabled
    disabled: this.fb.control<string>('', undefined, undefined, true),
    password: this.fb.control<string>(''),
    textarea: this.fb.control<string>(''),
  });

  constructor() {
    this.snackOnChange(this.form.controls.simple, 'Simple textbox');
    this.snackOnChange(this.form.controls.placeholder, 'Placeholder textbox');
    this.snackOnChange(this.form.controls.decorated, 'Decorated textbox');
    this.snackOnChange(this.form.controls.password, 'Password box');
    this.snackOnChange(this.form.controls.textarea, 'Text area');
  }

  // A snack once the user stops typing; value$ gives the current value first, which it skips
  private snackOnChange(control: FC<string>, name: string) {
    control.value$.pipe(skip(1), debounceTime(300), takeUntilDestroyed()).subscribe(value => {
      this.snacks.openSnack(`${name} set to: ${value || '<empty>'}`, 3000, 'info');
    });
  }
}
