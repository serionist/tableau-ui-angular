import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';

import { DateValidators, TableauUiDatePickerModule } from 'tableau-ui-angular/date-picker';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { CommonModule } from '@angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';

@Component({
    selector: 'app-date-picker-page',
    imports: [TableauUiCommonModule, TableauUiDatePickerModule, TableauUiFormModule, CommonModule, TableauUiFormFieldModule],
    standalone: true,
    templateUrl: './date-picker-page.component.html',
    styleUrl: './date-picker-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPageComponent {
    readonly b = inject(FB);
    readonly simpleControl = this.b.control<Date | undefined>(undefined, [Validators.required, DateValidators.minDate(new Date(2000, 0, 1)), DateValidators.maxDate(new Date(2030, 12, 31))]);

    constructor() {
        this.simpleControl.value$.subscribe((value) => {
            console.log(value, this.simpleControl.$value());
            console.log('simpleControl valueChange', value?.toISOString());
        });
    }
    valueChange(value: Date | undefined) {
        console.log('valueChange', value?.toISOString());
    }
}
