import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ControlReferenceBuilder, IOptionLineContext, SnackService } from 'component-library';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { DateValidators } from '../../../../../component-library/src/public-api';

@Component({
    selector: 'app-date-picker-page',
    templateUrl: './date-picker-page.component.html',
    styleUrl: './date-picker-page.component.scss',
    standalone: false,
})
export class DatePickerPageComponent {
    readonly b = inject(ControlReferenceBuilder);
    readonly simpleControl = this.b.control<Date>(new Date(), [
        Validators.required,
        DateValidators.minDate(new Date(2000, 0, 1)),
        DateValidators.maxDate(new Date(2030, 12, 31)),
    ]);

    constructor() {
        this.simpleControl.value$.subscribe((value) => {
            console.log(value);
            console.log('simpleControl valueChange', value?.toISOString());
        });
    }
    valueChange(value: Date | null) {
        console.log('valueChange', value?.toISOString());
    }
}
