import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-checkbox-forms-example',
  imports: [ReactiveFormsModule, TableauUiCheckboxModule, TableauUiCommonModule],
  templateUrl: './checkbox-forms.example.html',
  styleUrl: './checkbox-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFormsExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly form = new FormGroup({
    byName: new FormControl(false),
    byControl: new FormControl(true),
    disabled: new FormControl({ value: true, disabled: true }),
    required: new FormControl(false, Validators.requiredTrue),
    disabledRequired: new FormControl({ value: true, disabled: true }, Validators.requiredTrue),
  });

  // valueChange fires before the form has the new value, so the form's state is read from the value itself
  protected changed(name: string, value: boolean | 'partial', invalid = false) {
    this.snacks.openSnack(`${name} set to: ${value}`, 3000, invalid ? 'error' : 'info');
  }
}
