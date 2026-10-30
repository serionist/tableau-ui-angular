import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { debounceTime, skip } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import type { FC } from 'tableau-ui-angular/form';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

interface Fields {
  required: string;
  number: string;
}

@Component({
  selector: 'app-form-field-validation-example',
  imports: [TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiIconModule],
  templateUrl: './form-field-validation.example.html',
  styleUrl: './form-field-validation.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldValidationExampleComponent {
  private readonly fb = inject(FB);
  private readonly snacks = inject(SnackService);

  protected readonly form = this.fb.group<Fields>({
    required: this.fb.control<string>('', Validators.required),
    number: this.fb.control<string>('', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
  });

  constructor() {
    this.snackOnChange(this.form.controls.required, 'Validated textbox');
    this.snackOnChange(this.form.controls.number, 'Number box');
  }

  // An error snack while the value is invalid; $meta() holds the control's validity
  private snackOnChange(control: FC<string>, name: string) {
    control.value$.pipe(skip(1), debounceTime(300), takeUntilDestroyed()).subscribe(value => {
      this.snacks.openSnack(`${name} set to: ${value || '<empty>'}`, 3000, control.$meta().validity === 'INVALID' ? 'error' : 'info');
    });
  }
}
