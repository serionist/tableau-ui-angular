import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DateValidators, TableauUiDatePickerModule } from 'tableau-ui-angular/date-picker';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';

// Months count from 0, so 11 is December
const EARLIEST = new Date(2000, 0, 1);
const LATEST_DAY = new Date(2030, 11, 31);
const LATEST_TIME = new Date(2030, 11, 31, 23, 59);

@Component({
  selector: 'app-date-picker-forms-example',
  imports: [TableauUiCommonModule, TableauUiDatePickerModule, TableauUiFormModule, TableauUiFormFieldModule],
  templateUrl: './date-picker-forms.example.html',
  styleUrl: './date-picker-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerFormsExampleComponent {
  private readonly fb = inject(FB);

  // min and max only limit the browser's picker: a typed date outside them is still a value, which the validators
  // catch. Each error shows once the user leaves the input, as formHasError waits for it to be touched
  protected readonly day = this.fb.control<Date | undefined>(undefined, [Validators.required, DateValidators.minDate(EARLIEST), DateValidators.maxDate(LATEST_DAY)]);
  protected readonly meeting = this.fb.control<Date | undefined>(undefined, [Validators.required, DateValidators.minDate(EARLIEST), DateValidators.maxDate(LATEST_TIME)]);
}
