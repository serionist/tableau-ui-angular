import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ControlReferenceBuilder, SnackService } from 'component-library';

import { BehaviorSubject, debounceTime, skip, Subject } from 'rxjs';

@Component({
    selector: 'app-form-fields-page',
    standalone: false,
    templateUrl: './form-fields-page.component.html',
    styleUrl: './form-fields-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldsPageComponent implements OnInit {
    snackService = inject(SnackService);
    private readonly b = inject(ControlReferenceBuilder);
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
