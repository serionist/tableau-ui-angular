import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { FB } from 'tableau-ui-angular/form';
import { importFormBuilderProvider, importFormPipes } from 'tableau-ui-angular/form/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importDatePicker } from 'tableau-ui-angular/date-picker/imports';
import { importFormField } from 'tableau-ui-angular/form-field/imports';
import { DateValidators } from 'tableau-ui-angular/date-picker';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';

@Component({
    selector: 'app-date-picker-page',
    imports: [ImportDetailsComponent, ...importSeparator(), ...importFormPipes(), ...importDatePicker(), ...importFormField()],
    standalone: true,
    templateUrl: './date-picker-page.component.html',
    styleUrl: './date-picker-page.component.scss',
    providers: [...importFormBuilderProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPageComponent {
    readonly b = inject(FB);
    readonly simpleControl = this.b.control<Date>(new Date(), [Validators.required, DateValidators.minDate(new Date(2000, 0, 1)), DateValidators.maxDate(new Date(2030, 12, 31))]);

    import: ImportModel = {
        name: 'Date Picker',
        componentImports: [
            {
                name: 'DatePickerComponent',
                from: 'tableau-ui-angular/date-picker',
                info: 'Allows the use of <input date-picker> directive. Provide a type="date" or type="datetime-local" to the input element.',
            },
        ],
        importFunctions: [
            {
                name: 'importDatePicker',
                from: 'tableau-ui-angular/date-picker/imports',
                info: 'Imports date picker component and all its optional imports.',
            },
        ],
        optionalImportFunctions: [
            {
                name: 'importFormField',
                from: 'tableau-ui-angular/form-field/imports',
                info: 'Imports form field component to integrate with form fields, show labels, errors, hints, etc',
            },
        ],
    };
    constructor() {
        this.simpleControl.value$.subscribe((value) => {
            console.log(value);
            console.log('simpleControl valueChange', value.toISOString());
        });
    }
    valueChange(value: Date | undefined) {
        console.log('valueChange', value?.toISOString());
    }
}
