import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackService } from 'tableau-ui-angular/snack';
import type { Primitive } from 'tableau-ui-angular/types';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@Component({
    selector: 'app-checkbox-page',
    imports: [TableauUiCheckboxModule, TableauUiCommonModule, ReactiveFormsModule],
    standalone: true,
    templateUrl: './checkbox-page.component.html',
    styleUrl: './checkbox-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent implements OnInit {
    snackService = inject(SnackService);

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
