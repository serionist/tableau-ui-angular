import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { skip } from 'rxjs';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { FB } from 'tableau-ui-angular/form';
import { importFormBuilderProvider, importFormPipes } from 'tableau-ui-angular/form/imports';
import { importRadioGroup } from 'tableau-ui-angular/radio-group/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { Primitive } from 'tableau-ui-angular/types';
import type { ImportModel } from '../../components/import-details/import-model';

@Component({
    selector: 'app-radio-buttons-page',
    imports: [...importSeparator(), ...importRadioGroup(), ...importFormPipes(), ReactiveFormsModule],
    standalone: true,
    templateUrl: './radio-buttons-page.component.html',
    styleUrl: './radio-buttons-page.component.scss',
    providers: [...importSnackProvider(), ...importFormBuilderProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonsPageComponent implements OnInit {
    snackService = inject(SnackService);
    private readonly b = inject(FB);

    import: ImportModel = {
        name: 'Radio Group',
        componentImports: [
            {
                name: 'RadioGroupComponent',
                from: 'tableau-ui-angular/radio-group',
                info: 'Component for creating a group of radio buttons.',
            },
            {
                name: 'OptionComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for defining individual options within the radio group.',
            },
        ],
        optionalComponentImports: [
            {
                name: 'HintComponent',
                from: 'tableau-ui-angular/common',
                info: 'Optional component for displaying hints related to the radio group.',
            },
            {
                name: 'ErrorComponent',
                from: 'tableau-ui-angular/common',
                info: 'Optional component for displaying validation errors related to the radio group.',
            },
            {
                name: 'ReactiveFormsModule',
                from: '@angular/forms',
                info: 'Optional import for using radio group with reactive forms.',
            },
        ],
        importFunctions: [
            {
                name: 'importRadioGroup',
                from: 'tableau-ui-angular/radio-group/imports',
                info: 'Imports radio group component and all its optional imports.',
            },
        ],
    };
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
