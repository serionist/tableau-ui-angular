import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { Primitive } from 'tableau-ui-angular/types';
import type { ImportModel } from '../../components/import-details/import-model';

import { importCheckbox } from 'tableau-ui-angular/checkbox/imports';
import { ImportDetailsComponent } from "../../components/import-details/import-details.component";


@Component({
    selector: 'app-checkbox-page',
    imports: [...importSeparator(), ...importCheckbox(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './checkbox-page.component.html',
    styleUrl: './checkbox-page.component.scss',
    providers: [...importSnackProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent implements OnInit {
    snackService = inject(SnackService);

     import: ImportModel = {
            name: 'Checkbox',
            componentImports: [
                {
                    name: 'CheckboxComponent',
                    from: 'tableau-ui-angular/checkbox',
                }
            ],
            optionalComponentImports: [
                {
                    name: 'HintComponent',
                    from: 'tableau-ui-angular/common',
                    info: 'Optional hint component for displaying additional information inside the checkbox.'
                },
                {
                    name: 'ErrorComponent',
                    from: 'tableau-ui-angular/common',
                    info: 'Optional error component for displaying validation errors related to the checkbox.'
                },
                {
                    name: 'ReactiveFormsModule',
                    from: '@angular/forms',
                    info: 'Optional import for using checkbox with reactive forms.'
                }
            ],
            importFunctions: [
                {
                    name: 'importCheckbox',
                    from: 'tableau-ui-angular/checkbox/imports',
                    info: 'Imports checkbox component and all its optional imports.'
                }
            ]
        };
    simpleValue1 = true;
    simpleValue2 = false;

    valueChanged(value: Primitive, name: string, type: 'error' | 'info' = 'info') {
        console.log(`Value changed for ${name}:`, value);
        this.snackService.openSnack(`${name} set to: ${value}`, 3000, type);
    }

    form = new FormGroup({
        formControl1: new FormControl(false),
        formControl2: new FormControl(true),
        disabledControl: new FormControl({ value: true, disabled: true }),
        errorControl: new FormControl(false, Validators.requiredTrue),
        disabledErrorControl: new FormControl({ value: true, disabled: true }, Validators.requiredTrue),
    });

    ngOnInit(): void {
        this.form.controls.errorControl.markAsTouched();
        this.form.controls.errorControl.updateValueAndValidity();
        this.form.controls.disabledErrorControl.markAsTouched();
        this.form.controls.disabledErrorControl.updateValueAndValidity();
    }
}
