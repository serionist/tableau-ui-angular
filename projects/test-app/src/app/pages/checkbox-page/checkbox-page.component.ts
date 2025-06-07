import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-checkbox-page',
    standalone: false,
    templateUrl: './checkbox-page.component.html',
    styleUrl: './checkbox-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent implements OnInit {
    snackService = inject(SnackService);

    simpleValue1 = true;
    simpleValue2 = false;

    valueChanged(value: any, name: string, type: 'info' | 'error' = 'info') {
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
