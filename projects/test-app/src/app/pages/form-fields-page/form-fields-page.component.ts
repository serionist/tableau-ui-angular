import { Component, inject, OnInit, signal } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { SnackService } from 'component-library';

import { BehaviorSubject, debounceTime, Subject } from 'rxjs';

@Component({
    selector: 'app-form-fields-page',
    templateUrl: './form-fields-page.component.html',
    styleUrl: './form-fields-page.component.scss',
    standalone: false,
})
export class FormFieldsPageComponent implements OnInit {
    snackService = inject(SnackService);

    valueChanged(
        value: string | null,
        name: string,
        type: 'info' | 'error' = 'info'
    ) {
        console.log(`Value changed for ${name}:`, value || '<empty>');
        this.snackService.openSnack(
            `${name} set to: ${value || '<empty>'}`,
            3000,
            type
        );
    }
    valueInput(value: string | null, name: string) {
        console.log(`Value input for ${name}:`, value || '<empty>');
    }

    form = new FormGroup({
        simple: new FormControl(''),
        simple2: new FormControl(''),
        simple3: new FormControl(''),
        disabled: new FormControl({ value: '', disabled: true }),
        validation: new FormControl('', Validators.required),
        password: new FormControl(''),
        number: new FormControl('', [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d+$/),
        ]),
        textarea: new FormControl(''),

        advancedValidation: new FormControl('', [Validators.required]),
    });

    ngOnInit(): void {
        this.form.controls.validation.markAsTouched();
        this.form.controls.validation.updateValueAndValidity();
        this.form.controls.number.markAsTouched();
        this.form.controls.number.updateValueAndValidity();
        this.form.controls.advancedValidation.markAsTouched();
        this.form.controls.advancedValidation.updateValueAndValidity();

        this.form.controls.simple.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) => this.valueChanged(value, 'Simple textBox'));
        this.form.controls.simple2.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) =>
                this.valueChanged(value, 'Placeholder textbox')
            );
        this.form.controls.simple3.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) =>
                this.valueChanged(value, 'Decorated textBox')
            );
        this.form.controls.disabled.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) => this.valueChanged(value, 'Disabled textBox'));
        this.form.controls.validation.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) =>
                this.valueChanged(
                    value,
                    'Validation textBox',
                    this.form.controls.validation.invalid ? 'error' : 'info'
                )
            );
        this.form.controls.password.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) => this.valueChanged(value, 'Password box'));
        this.form.controls.number.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) =>
                this.valueChanged(
                    value,
                    'Number box',
                    this.form.controls.number.invalid ? 'error' : 'info'
                )
            );
        this.form.controls.textarea.valueChanges
            .pipe(debounceTime(300))
            .subscribe((value) => this.valueChanged(value, 'Text area'));


        this.searchBounce.pipe(debounceTime(200)).subscribe(() => this.performSearch());
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
    searching = signal(false);
    searchResults$ = new BehaviorSubject<{ name: string }[]>(
        this.randomNames
    );

    searchBounce = new Subject<void>();
    searchValueChanged(value: string) {
        this.searchValue$.next(value);
        this.searchBounce.next();
    }
    performSearch() {
        this.searching.set(true);
        setTimeout(() => {
            this.searchResults$.next(
                this.randomNames.filter((e) =>
                    e.search.includes(
                        this.getSearchString(this.searchValue$.value)
                    )
                )
            );
            this.searching.set(false);
        }, 1000);
    }
}
