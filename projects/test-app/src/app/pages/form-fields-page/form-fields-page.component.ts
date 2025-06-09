import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';

import { BehaviorSubject, debounceTime, skip, Subject } from 'rxjs';
import { importLoadingGif, importSeparator } from 'tableau-ui-angular/common/imports';
import { FB } from 'tableau-ui-angular/form';
import { importFormField } from 'tableau-ui-angular/form-field/imports';
import { importFormBuilderProvider, importFormPipes } from 'tableau-ui-angular/form/imports';
import { importIcons } from 'tableau-ui-angular/icon/imports';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';
import { AutoCompleteComponent } from 'tableau-ui-angular/autocomplete';
import { importAutocomplete } from 'tableau-ui-angular/autocomplete/imports';

@Component({
    selector: 'app-form-fields-page',
    imports: [...importSeparator(), ...importLoadingGif(), ...importIcons(), ...importFormField(), ...importFormPipes(), ImportDetailsComponent, ...importAutocomplete()],
    standalone: true,
    templateUrl: './form-fields-page.component.html',
    styleUrl: './form-fields-page.component.scss',
    providers: [...importSnackProvider(), ...importFormBuilderProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldsPageComponent implements OnInit {
    snackService = inject(SnackService);

    imports: ImportModel = {
        name: 'Form Fields',
        componentImports: [
            {
                name: 'FormFieldComponent',
                from: 'tableau-ui-angular/form-field',
                info: 'Component for creating form fields with labels, errors, hints, and more.',
            },
        ],
        optionalComponentImports: [
            {
                name: 'LabelComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for defining the label of the form field.',
            },
            {
                name: 'HintComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying additional information inside the form field.',
            },
            {
                name: 'ErrorComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying validation errors related to the form field.',
            },
            {
                name: 'PrefixComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying a prefix inside the form field, typically used for currency or units.',
            },
            {
                name: 'SuffixComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying a suffix inside the form field, typically used for currency or units.',
            },
            {
                name: 'ReactiveFormsModule',
                from: '@angular/forms',
                info: 'Optional import for using form fields with reactive forms.',
            },
        ],
        importFunctions: [
            {
                name: 'importFormField',
                from: 'tableau-ui-angular/form-field/imports',
                info: 'Imports form field component and all its optional imports.',
            },
        ],
        optionalImportFunctions: [
            {
                name: 'importFormPipes',
                from: 'tableau-ui-angular/form/imports',
                info: 'Imports form pipes for BetterForms integration, such as `formMeta`, `formControl`, `formControlValue`, etc.',
            },
        ],
    };

    autocompleteImport: ImportModel = {
        name: 'Autocomplete',
        componentImports: [
            {
                name: 'AutoCompleteComponent',
                from: 'tableau-ui-angular/autocomplete',
                info: 'Component for creating autocomplete input fields with suggestions.',
            },
            {
                name: 'AutoCompleteDirective',
                from: 'tableau-ui-angular/autocomplete',
                info: 'Directive for enabling autocomplete functionality on input elements.',
            },
            {
                name: 'OptionComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for defining individual options in the autocomplete dropdown.',
            },
        ],
        optionalComponentImports: [
            {
                name: 'LabelComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for defining the label of the form field.',
            },
            {
                name: 'HintComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying additional information inside the form field.',
            },
            {
                name: 'ErrorComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying validation errors related to the form field.',
            },
            {
                name: 'PrefixComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying a prefix inside the form field, typically used for currency or units.',
            },
            {
                name: 'SuffixComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying a suffix inside the form field, typically used for currency or units.',
            },
            {
                name: 'ReactiveFormsModule',
                from: '@angular/forms',
                info: 'Optional import for using form fields with reactive forms.',
            },
        ],
        importFunctions: [
            {
                name: 'importAutocomplete',
                from: 'tableau-ui-angular/autocomplete/imports',
                info: 'Imports autocomplete component and all its optional imports.',
            },
        ],
        optionalImportFunctions: [
            {
                name: 'importFormPipes',
                from: 'tableau-ui-angular/form/imports',
                info: 'Imports form pipes for BetterForms integration, such as `formMeta`, `formControl`, `formControlValue`, etc.',
            },
        ],
        optionalProviderImports: [
            {
                name: 'FB',
                from: 'tableau-ui-angular/form',
                info: 'Form Builder service for creating reactive forms with BetterForms.',
            },
        ],
        optionalProviderImportFunctions: [
            {
                name: 'importFormBuilderProvider',
                from: 'tableau-ui-angular/form/imports',
                info: 'Imports form builder provider for creating reactive forms with BetterForms.',
            },
        ],
    };

    private readonly b = inject(FB);
    valueChanged(event: Event, name: string, type: 'error' | 'info' = 'info') {
        this.valueChangedInternal((event.target as HTMLInputElement).value, name, type);
    }
    private valueChangedInternal(value: string | null, name: string, type: 'error' | 'info' = 'info') {
        console.log(`Value changed for ${name}:`, value ?? '<empty>');
        this.snackService.openSnack(`${name} set to: ${value ?? '<empty>'}`, 3000, type);
    }
    valueInput(event: Event, name: string) {
        const { value } = event.target as HTMLInputElement;
        console.log(`Value input for ${name}:`, value || '<empty>');
    }

    form = this.b.group<FormValue>({
        simple: this.b.control<string>(''),
        simple2: this.b.control<string>(''),
        simple3: this.b.control<string>(''),
        disabled: this.b.control<string>('', undefined, undefined, true),
        validation: this.b.control<string>('', Validators.required),
        password: this.b.control<string>(''),
        number: this.b.control<string>('', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
        textarea: this.b.control<string>(''),

        advancedValidation: this.b.control<string>('', [Validators.required]),
    });

    ngOnInit(): void {
        this.form.controls.simple.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Simple textBox');
        });
        this.form.controls.simple2.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Placeholder textbox');
        });
        this.form.controls.simple3.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Decorated textBox');
        });
        this.form.controls.disabled.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Disabled textBox');
        });
        this.form.controls.validation.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Validation textBox', this.form.controls.validation.$meta().validity === 'INVALID' ? 'error' : 'info');
        });
        this.form.controls.password.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Password box');
        });
        this.form.controls.number.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Number box', this.form.controls.number.$meta().validity === 'INVALID' ? 'error' : 'info');
        });
        this.form.controls.textarea.value$.pipe(skip(1), debounceTime(300)).subscribe((value) => {
            this.valueChangedInternal(value, 'Text area');
        });

        this.searchBounce.pipe(skip(1), debounceTime(200)).subscribe(() => {
            this.performSearch();
        });
    }

    names = [
        'John Smith',
        'Jane Doe',
        'Michael Johnson',
        'Emily Davis',
        'William Brown',
        'Olivia Wilson',
        'James Taylor',
        'Sophia Martinez',
        'Benjamin Lee',
        'Isabella Anderson',
        'Henry Thomas',
        'Mia Jackson',
        'Daniel White',
        'Charlotte Harris',
        'Matthew Clark',
        'Amelia Lewis',
        'Andrew Walker',
        'Harper Young',
        'David Hall',
        'Evelyn Allen',
        'Joseph Wright',
        'Ella King',
        'Charles Scott',
        'Scarlett Green',
        'Christopher Adams',
        'Grace Nelson',
        'Alexander Baker',
        'Zoey Carter',
        'Samuel Perez',
        'Nora Mitchell',
        'Gabriel Roberts',
        'Lily Turner',
        'Jack Phillips',
        'Hannah Campbell',
        'Owen Parker',
        'Aria Evans',
        'Lucas Edwards',
        'Lillian Collins',
        'Mason Stewart',
        'Avery Sanchez',
        'Ethan Morris',
        'Layla Rogers',
        'Logan Reed',
        'Penelope Cook',
        'Jacob Morgan',
        'Victoria Bell',
        'Sebastian Murphy',
        'Addison Bailey',
        'Aiden Cooper',
        'Riley Rivera',
    ];

    randomNames = this.names.map((fullName, index) => {
        return {
            name: fullName,
            search: this.getSearchString(fullName),
        };
    });

    getSearchString(input: string) {
        return input
            .split(' ')
            .map((e) => e.toLowerCase())
            .join('|');
    }

    searchValue$ = new BehaviorSubject<string>('');
    readonly $searching = signal(false);
    searchResults$ = new BehaviorSubject<{ name: string }[]>(this.randomNames);

    searchBounce = new Subject<void>();
    searchValueChanged(event: Event) {
        this.searchValue$.next((event.target as HTMLInputElement).value);
        this.searchBounce.next();
    }
    performSearch() {
        this.$searching.set(true);
        setTimeout(() => {
            this.searchResults$.next(this.randomNames.filter((e) => e.search.includes(this.getSearchString(this.searchValue$.value))));
            this.$searching.set(false);
        }, 1000);
    }
}
interface FormValue {
    simple: string;
    simple2: string;
    simple3: string;
    disabled: string;
    validation: string;
    password: string;
    number: string;
    textarea: string;
    advancedValidation: string;
}
