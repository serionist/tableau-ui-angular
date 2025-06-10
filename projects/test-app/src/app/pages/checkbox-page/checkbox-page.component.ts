import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackService } from 'tableau-ui-angular/snack';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';

@Component({
    selector: 'app-checkbox-page',
    imports: [TableauUiCheckboxModule, TableauUiCommonModule, ReactiveFormsModule, TableauUiButtonModule],
    standalone: true,
    templateUrl: './checkbox-page.component.html',
    styleUrl: './checkbox-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent implements OnInit {
    snackService = inject(SnackService);

    simpleValue1 = true;
    simpleValue2 = false;
    loadingValue = false;
    readonly $loading = signal(false);
    partialValue : boolean | 'partial' = 'partial';

    valueChanged(value: boolean | 'partial', name: string, type: 'error' | 'info' = 'info', triggerLoading: boolean = false) {
        console.log(`Value changed for ${name}:`, value);
        if (triggerLoading) {
            this.$loading.set(true);
            setTimeout(() => {
                this.$loading.set(false);
            }, 2000);
        }
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
