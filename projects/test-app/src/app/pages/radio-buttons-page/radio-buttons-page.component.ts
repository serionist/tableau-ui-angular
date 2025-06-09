import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { skip } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
    selector: 'app-radio-buttons-page',
    imports: [TableauUiSnackModule, TableauUiFormModule, TableauUiFormFieldModule, TableauUiCommonModule, TableauUiRadioGroupModule, TableauUiIconModule],
    standalone: true,
    templateUrl: './radio-buttons-page.component.html',
    styleUrl: './radio-buttons-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonsPageComponent implements OnInit {
    snackService = inject(SnackService);
    private readonly b = inject(FB);

    simpleValue = 1;

    formControl = this.b.control<number | null>(null, [Validators.required, Validators.min(2), Validators.max(3)]);

    valueChanged(value: Primitive, name: string, type: 'error' | 'info' = 'info') {
        console.log(`Value changed for ${name}:`, value);
        this.snackService.openSnack(`${name} set to: ${value}`, 3000, type);
    }
    ngOnInit(): void {
        this.formControl.metaFn.markAllAsTouched();
        this.formControl.value$.pipe(skip(1)).subscribe((value) => {
            this.valueChanged(value, 'Form Control', this.formControl.$meta().validity === 'INVALID' ? 'error' : 'info');
        });
    }
}
