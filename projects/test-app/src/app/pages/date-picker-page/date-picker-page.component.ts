import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IOptionLineContext, SnackService } from 'component-library';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { DateValidators } from '../../../../../component-library/src/public-api';

@Component({
    selector: 'app-date-picker-page',
    templateUrl: './date-picker-page.component.html',
    styleUrl: './date-picker-page.component.scss',
    standalone: false,
})
export class DatePickerPageComponent {
    readonly simpleControl = new FormControl<Date>(new Date(), [
        Validators.required,
        DateValidators.minDate(new Date(2000, 0, 1)),
        DateValidators.maxDate(new Date(2030, 12, 31)),
    ]);

    constructor() {
        this.simpleControl.valueChanges.subscribe((value) => {
            console.log('simpleControl valueChange', value?.toISOString());
        });
    }
    valueChange(value: Date | null) {
        console.log('valueChange', value?.toISOString());
    }
}
